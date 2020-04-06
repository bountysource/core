# == Schema Information
#
# Table name: events
#
#  id         :integer          not null, primary key
#  slug       :string(255)      not null
#  title      :string(255)
#  url        :string(255)
#  issue_ids  :integer          default([]), not null, is an Array
#  created_at :datetime
#  updated_at :datetime
#  subtitle   :string(255)
#

class Github::Event

  def self.firehose!
    ApplicationRecord.logger.level = 1

    previous_event_ids = []
    while true
      # load 1st page and optionally 2nd page of events
      current_events = get_current_events(1)
      current_events += get_current_events(2) if (current_events.map { |e| e['id'].to_i } - previous_event_ids).length == 30
      new_events = current_events.reject { |event| previous_event_ids.include?(event['id'].to_i) }

      unless new_events.length == 0
        delay(queue: 'firehose', priority: 100).process_events(new_events)
        ApplicationRecord.logger.info "Queued #{new_events.length} events"

        previous_event_ids = (previous_event_ids + new_events.map { |e| e['id'].to_i }).sort.last(300)
      end

      sleep 1
    end
  end

  def self.get_current_events(page=1)
    url = "https://api.github.com/events?client_id=#{ENV['GITHUB_FIREHOSE_CLIENT_ID']}&client_secret=#{ENV['GITHUB_FIREHOSE_CLIENT_SECRET']}&page=#{page}"
    response = HTTParty.get(url, headers: { "User-Agent" => "GithubEvents 0.1" } )
    body = JSON.parse(response.body)

    if body.is_a?(Array)
      return body.reverse
    else
      puts "Github API message: #{body['message']}"
      return []
    end
 
  rescue => e
    puts "Exception while fetching events: #{e.message}"
    return []
  end

  def self.linked_account(github_data, options={})
    LinkedAccount::Github.update_attributes_from_github_data(github_data, options)
  end

  def self.tracker(github_data, options={})
    Github::Repository.update_attributes_from_github_data(github_data, options)
  end

  def self.issue(github_data, options={})
    Github::Issue.update_attributes_from_github_data(github_data, options)
  end

  def self.comment(github_data, options={})
    options[:issue].update_comments_from_github_data(github_data)
  end

  def self.process_events(events)
    events.each { |e| process_event(e) }
  end

  def self.process_event(event)
    repo  = tracker(event['repo']) if event['repo']
    actor = linked_account(event['actor'].merge('type' => 'User')) if event['actor']
    org   = linked_account(event['org'].merge('type' => 'Organization')) if event['org']

    case event['type']
    when 'IssueCommentEvent'
      issue = issue(event['payload']['issue'], tracker: repo)
      comment(event['payload']['comment'], issue: issue)

    when 'PullRequestEvent'
      # NOTE: we can NOT pass in the pull_request here because it doesn't have the right remote_id for issue
      #issue(event['payload']['pull_request'], tracker: repo)

      linked_account(event['payload']['pull_request']['head']['user'])
      tracker(event['payload']['pull_request']['head']['repo'])
      linked_account(event['payload']['pull_request']['base']['user'])
      tracker(event['payload']['pull_request']['base']['repo'])

    when 'IssuesEvent'
      issue(event['payload']['issue'], tracker: repo)

    when 'ForkEvent'
      tracker(event['payload']['forkee'])

    when 'MemberEvent'
      # TODO: sync person-tracker relation here
      linked_account(event['payload']['member'])

    end

  rescue => exception
    NewRelic::Agent.agent.error_collector.notice_error(exception)
    Rails.logger.error "\nFailed to process event: #{event['type']}\n-------- EVENT DATA --------\n#{event}\n-------- EXCEPTION -------- \n#{exception}\n-------- BACKTRACE --------\n#{exception.backtrace.join("\n")}"
  end

end
