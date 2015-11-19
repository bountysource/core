# == Schema Information
#
# Table name: issue_ranks
#
#  id                    :integer          not null, primary key
#  type                  :string(255)      not null
#  issue_id              :integer          not null
#  rank                  :integer          default(0), not null
#  person_id             :integer
#  team_id               :integer
#  linked_account_id     :integer
#  last_synced_at        :datetime
#  last_event_created_at :datetime
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  excluded              :boolean          default(FALSE), not null
#
# Indexes
#
#  index_issue_ranks_on_issue_id               (issue_id)
#  index_issue_ranks_on_last_event_created_at  (last_event_created_at)
#  index_issue_ranks_on_linked_account_id      (linked_account_id)
#  index_issue_ranks_on_person_id              (person_id)
#  index_issue_ranks_on_rank                   (rank)
#  index_issue_ranks_on_team_id                (team_id)
#  index_issue_ranks_on_type                   (type)
#

class IssueRank::LinkedAccountGithub < IssueRank

  # List of events that we consider for weighting an issue rank
  def self.weighted_events
    %w(IssueCommentEvent IssuesEvent)
  end

  # Filter so that we do not insert rows for closed issue actions
  def self.record_event?(event_data)
    if event_data['type'] == 'IssuesEvent'
      event_data['payload']['action'].downcase != 'closed'
    elsif event_data['type'] == 'IssueCommentEvent'
      issue_data = event_data['payload']['issue']

      # Skip if pull request data present (meaning the Issue is a PullRequest)
      issue_data['pull_request']['html_url'].nil?
    else
      weighted_events.include?(event_data['type'])
    end
  end

  def self.get_issue_from_event(event_data)
    issue_data = event_data['payload']['issue']

    # There are some old payloads where the entire object is a min issue.
    if issue_data && issue_data.is_a?(Hash)
      Tracker.magically_turn_url_into_tracker_or_issue(issue_data['html_url'])
    end
  end

  def self.rank_value_for_event(event_data)
    case event_data['type']
    when 'IssueCommentEvent' then
      3
    when 'IssuesEvent'
      if event_data['payload']['action'].downcase == 'closed'
        0
      else
        5 # Issue opened or reopened
      end
    else
      0
    end
  end

  # Increment rank from GitHub event JSON
  def self.increment_rank_from_events(linked_account, events)
    ActiveRecord::Base.transaction do
      issue_rank_ids = []
      events.each do |event_data|
        # Skip if it's not a whitelisted event
        next unless weighted_events.include?(event_data['type'])

        issue = get_issue_from_event(event_data)
        next unless issue
        event_created_at = DateTime.parse(event_data['created_at'])

        # Find or create the IssueRank model
        issue_rank = where(issue_id: issue.id, linked_account_id: linked_account.id).first
        if !issue_rank && record_event?(event_data)
          issue_rank ||= create!(issue: issue, linked_account: linked_account)
        end

        # We don't care about this event.
        next unless issue_rank

        # Skip if the event was created before the last_synced_at date
        next if issue_rank.last_synced_at && event_created_at < issue_rank.last_synced_at

        issue_rank.rank += rank_value_for_event(event_data)

        # Record the created_at date of the last accepted event if it's more recent than the current value.
        if issue_rank.last_event_created_at.nil? || event_created_at > issue_rank.last_event_created_at
          issue_rank.last_event_created_at = event_created_at
        end

        issue_rank.save!
        issue_rank_ids << issue_rank.id
      end
      issue_ranks = IssueRank::LinkedAccountGithub.where(id: issue_rank_ids)
      issue_ranks.update_all(last_synced_at: DateTime.now)
      issue_ranks
    end
  end
end
