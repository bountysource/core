class Api::V2::ThumbsController < Api::BaseController

  def index
    raise "Unexpected input" unless params[:url].is_a?(String) || params[:urls].is_a?(Array)

    issue_urls = (params[:urls] || [params[:url]])
    issue_hash = Issue.where(url: issue_urls).inject({}) { |h,issue| h[issue.url] = issue; h }

    render json: (issue_urls.map do |url|
      issue = issue_hash[url]

      if issue && !issue.thumbs_up_count.nil?
        # issue is ready to go!
        if params[:impression] == 'show'
          @item = issue
          logger = self.class.log_activity(Issue::Event::VIEW)
          instance_eval(&logger)
        end

        {
          issue_id: issue.id,
          thumbs_up_count: issue.thumbs_up_count,

          # TODO: batch these up so we're not doing tons of reqs
          has_thumbed_up: current_user && (current_user.thumbs.up_votes.where(item: issue).count>0)
        }
      elsif issue
        # issue found but not synced, synced if need be
        if !issue.synced_at || issue.synced_at < 1.minute.ago
          issue.update_attributes(synced_at: Time.now)
          issue.delay.remote_sync
        end
        {
          retry: true
        }
      else
        # issue not yet found, queue it and try again later
        Tracker.delay.magically_turn_url_into_tracker_or_issue(url, remote_sync_on_create: true)
        {
          retry: true
        }
      end

    end)
  end

  def create
    if params[:issue_id] && (@item = Issue.find(params[:issue_id]))
      if current_user
        attr_updates = {
          explicit: true,
          downvote: params[:downvote].to_bool,
          thumbed_at: Time.now
        }

        if thumb = current_user.thumbs.where(item: @item).first
          thumb.update_attributes!(attr_updates)
        else
          thumb = current_user.thumbs.create!(attr_updates.merge(item: @item))
        end

        @item.update_thumbs_up_count

        render json: {
          issue_id: @item.id,
          thumbs_up_count: @item.thumbs_up_count,
          has_thumbed_up: !thumb.downvote?
        }
      # elsif @item.is_a?(Github::Issue)
      #   render json: {
      #     redirect_to: LinkedAccount::Github.oauth_url(state: LinkedAccount::Base.encode_state(redirect_url: @item.url))
      #   }
      else
        render json: {
          redirect_to: 'https://www.bountysource.com/signin'
        }
      end
    else
      raise "No issue id"
    end
  end

  def feedback
    Mailer.extension_feedback(message: params[:message], email: params[:email], person: current_user).deliver
    render json: true
  end

end
