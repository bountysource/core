# == Schema Information
#
# Table name: github_stargazers
#
#  id                :integer          not null, primary key
#  linked_account_id :integer          not null
#  tracker_id        :integer          not null
#  stargazer         :boolean
#  subscriber        :boolean
#  forker            :boolean
#  synced_at         :datetime
#  created_at        :datetime
#  updated_at        :datetime
#

class GithubStargazer < ApplicationRecord
  belongs_to :linked_account, class_name: 'LinkedAccount::Github::User'
  belongs_to :tracker, class_name: 'Github::Repository'

  # options
  # - oauth_token
  # - tracker_ids:[123,456] | tracker_id:123
  def self.sync_stargazers_for(options)
    # require trackers
    return if options[:tracker_ids].blank?

    # get array of all stargazers, watchers, and forkers
    start_time = Time.now
    responses = get_responses_from_github_api(options)
    logger.error "STARGAZER API TIME: #{Time.now-start_time}"

    # # delete existing stargazers
    GithubStargazer.where(tracker_id: options[:tracker_ids]).delete_all

    # translate array into hash and group by github user and tracker id
    response_hash = responses.inject({}) do |h,(tr_id, gh_uid, w_type)|
      h[gh_uid] ||= {}
      h[gh_uid][tr_id] ||= {}
      h[gh_uid][tr_id][w_type] = true
      h
    end

    # create all linked accounts
    time_now_sql = GithubStargazer.connection.quote(Time.now)
    response_hash.to_a.in_groups_of(1000,false) do |group|
      # find which github remote ids we're dealing with
      gh_uids = group.map(&:first)

      # create any missing linked_accounts
      rails_autoload = [LinkedAccount::Github, LinkedAccount::Github::Organization, LinkedAccount::Github::User]
      existing_gh_uids = LinkedAccount::Github.where(uid: gh_uids).pluck(:uid)
      missing_gh_uids = gh_uids - existing_gh_uids
      if missing_gh_uids.length > 0
        missing_gh_uids_sql = missing_gh_uids.map { |uid| "(#{time_now_sql}, #{time_now_sql}, 'LinkedAccount::Github::User', #{uid.to_i})" }
        LinkedAccount::Github.connection.insert("INSERT INTO linked_accounts (created_at, updated_at, type, uid) VALUES #{missing_gh_uids_sql.join(',')}")
      end

      # create linked account hash
      linked_account_hash = LinkedAccount::Github.where(uid: gh_uids).pluck(:id, :uid).inject({}) { |h,(id,uid)| h[uid]=id; h }

      stargazer_inserts = []
      group.each do |ghuid, tracker_map|
        tracker_map.each do |tracker_id, hash|
          stargazer_inserts << "(#{time_now_sql}, #{time_now_sql}, #{linked_account_hash[ghuid]}, #{tracker_id}, #{!!hash[:stargazer]}, #{!!hash[:subscriber]}, #{!!hash[:forker]})"
        end
      end
      GithubStargazer.connection.insert("INSERT INTO github_stargazers (created_at, updated_at, linked_account_id, tracker_id, stargazer, subscriber, forker) VALUES #{stargazer_inserts.join(',')}")
    end
  end

protected

  # this is an event machine that does 20 concurrent connections to get all of the stargazers, watchers, and forkers
  def self.get_responses_from_github_api(options)
    # queue up initial page loads, with page=nil
    requests = []
    tracker_map = Tracker.where(id: options[:tracker_ids]).pluck(:id, :remote_id).inject({}) { |h,(id,remote_id)| h[id] = remote_id; h }
    options[:tracker_ids].each do |tracker_id|
      [:stargazer, :subscriber, :forker].each do |watch_type|
        requests.push(
          tracker_id: tracker_id,
          github_repository_uid: tracker_map[tracker_id],
          watch_type: watch_type
        )
      end
    end

    # where the responses go
    responses = []

    concurrent_requests = 0
    max_concurrent_requests = 20
    no_requests_until = Time.now

    EM.run do

      repeater = Proc.new do
        # puts "REPEATER #{concurrent_requests} < #{max_concurrent_requests} && #{requests.length} > 0 && #{no_requests_until} < #{Time.now}"
        if concurrent_requests < max_concurrent_requests && requests.length > 0 && no_requests_until < Time.now
          concurrent_requests += 1

          request = requests.shift

          url_path = case request[:watch_type]
            when :stargazer then 'stargazers'
            when :subscriber then 'subscribers'
            when :forker then 'forks'
          end

          # generate request
          params = { per_page: 25 }
          params[:page] = request[:page] if request[:page]
          if options[:oauth_token]
            params[:oauth_token] = options[:oauth_token]
          else
            params[:client_id] = Api::Application.config.github_api[:client_id]
            params[:client_secret] = Api::Application.config.github_api[:client_secret]
          end
          url = "https://api.github.com/repositories/#{request[:github_repository_uid]}/#{url_path}?#{params.to_param}"
          # puts "REQUEST: #{url}"
          http = EventMachine::HttpRequest.new(url).get


          callback = proc { |http|
            # puts "RESPONSE: #{url}"
            concurrent_requests -= 1

            if http.response_header.status == 200
              # if the request was for the first page (page=nil), then queue up the rest of the pages
              if http.response_header['LINK'] && !request[:page]
                last_page = http.response_header['LINK'].scan(/page=(\d+)>; rel="last"/)[0][0].to_i
                (2..last_page).each { |page| requests << request.merge(page: page) }
              end

              # parse response
              JSON.parse(http.response).each do |row|
                responses << [
                  request[:tracker_id],
                  request[:watch_type] == :forker ? row['owner']['id'] : row['id'],
                  request[:watch_type]
                ]
              end

              # queue the next one
              repeater.call
            elsif http.response_header.status == 404
              # tracker deleted! queue remote_sync so it gets marked as deleted
              Tracker.find(request[:tracker_id]).delay.remote_sync
            elsif http.response.try(:include?, "abuse-rate-limits") && (request[:retries]||0) < 3
              puts "DELAY 60 SECONDS"
              no_requests_until = Time.now + 60.seconds
              requests << request.merge(retries: (request[:retries]||0) + 1)
            else
              puts "ERROR: #{url}"
              puts http.try(:errors)
              puts http.response
              pp http.response_header
              EM.stop
            end
          }
          http.callback &callback
          http.errback &callback

          # if we queued a request, maybe we can queue another
          repeater.call
        elsif concurrent_requests == 0 && requests.length == 0
          EM.stop
        end
      end

      EventMachine::PeriodicTimer.new(1) { repeater.call }
      repeater.call
    end

    responses
  end

end
