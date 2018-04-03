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

class Comment < ApplicationRecord
  belongs_to :issue
  belongs_to :author, class_name: 'LinkedAccount::Base', foreign_key: :author_linked_account_id

  validates :remote_id, presence: true
  validates :issue_id, presence: true

  def sanitized_body_html
    return Takedown::SANITIZED_HTML if takendown?
    html = body_markdown ? GitHub::Markdown.render_gfm(body_markdown) : body_html
    html = ActionController::Base.helpers.sanitize(html)
    html = %(<div style="white-space: pre-wrap;">#{html}</div>) if issue.is_a?(Bugzilla::Issue)
    html
  end

  def thumbs_up?
    body = (body_html||body_markdown)
    # remove email replies: \n\n\nOn Sat, Jun 7, 2014 at 5:02 PM, Westbrook <notifications@github.com> wrote:\n\n
    body = body.gsub(/(\r?\n){2}On[\s\S]*?wrote:(\r?\n){2}[\s\S]+$/,'')
    !!(body =~ /:\+1:|:thumbsup:|(^|\s|>)\+1([^0-9]|$)/)
  end

  def author_name
    super || 'Unknown'
  end

  def author_or_dummy_author
    if takendown?
      LinkedAccount::Base.new(login: Takedown::DISPLAY_NAME)
    elsif author.nil?
      LinkedAccount::Base.new(login: author_name)
    else
      author
    end
  end

  def takendown?
    author_linked_account_id && Takedown.linked_account_id_has_takedown?(author_linked_account_id)
  end

end
