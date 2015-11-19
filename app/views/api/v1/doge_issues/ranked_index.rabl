collection @issue_ranks

attribute :rank
node(:relevance) do |issue_rank|
  [(issue_rank.rank.to_f / @max_rank.to_f) * 100, 100].min.round
end

glue(:issue => :issue) { extends "api/v1/doge_issues/partials/issue" }
