module IssueMetaTagsHelper
  def title_helper(issue)
    if issue.bounty_total > 0
      "#{number_to_currency(issue.bounty_total, precision: 0)} Bounty on #{issue.tracker.name}"
    elsif issue.bounty_total == 0 && !issue.paid_out
      "Post a bounty on #{issue.tracker.name}!"
    elsif issue.paid_out
      #assumes there is only one paid_out bounty_claim for this issue
      "A #{number_to_currency(issue.bounty_claims.collected.first.amount.to_i, precision: 0)} Bounty has been paid out for #{issue.tracker.name}"
    else
      #shouldn't occur, but just in case
      "Check out this issue on Bountysource!"
    end
  end
end
