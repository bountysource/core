FactoryBot.define do
  factory :issue_rank, class: IssueRank do
    type 'IssueRank'
    rank 1

    factory :team_issue_rank, class: IssueRank::TeamRank do
      type 'IssueRank::TeamRank'
    end

    factory :linked_account_issue_rank, class: IssueRank::LinkedAccountGithub do
      type 'IssueRank::TeamRank'
    end
  end
end