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

class IssueRank::TeamRank < IssueRank
end
