# == Schema Information
#
# Table name: comments
#
#  id                       :integer          not null, primary key
#  issue_id                 :integer          not null
#  remote_id                :integer          not null
#  synced_at                :datetime
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  sync_in_progress         :boolean          default(FALSE), not null
#  body_html                :text
#  author_linked_account_id :integer
#  author_name              :string
#  body_markdown            :text
#
# Indexes
#
#  index_comments_on_author_linked_account_id  (author_linked_account_id)
#  index_comments_on_issue_id                  (issue_id)
#

FactoryBot.define do
  factory :comment, class: Comment do
    sequence(:remote_id) { |n| n }
    body_html %(<p class="amazing-paragraph">wow, such comment</p>)
  end
end
