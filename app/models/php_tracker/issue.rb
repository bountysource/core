# == Schema Information
#
# Table name: issues
#
#  id                       :integer          not null, primary key
#  github_pull_request_id   :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  number                   :integer
#  url                      :string(255)      not null
#  title                    :text
#  labels                   :string(255)
#  code                     :boolean          default(FALSE)
#  state                    :string(255)
#  body                     :text
#  remote_updated_at        :datetime
#  remote_id                :integer
#  tracker_id               :integer
#  solution_id              :integer
#  featured                 :boolean          default(FALSE), not null
#  remote_created_at        :datetime
#  synced_at                :datetime
#  comment_count            :integer          default(0)
#  sync_in_progress         :boolean          default(FALSE), not null
#  bounty_total             :decimal(10, 2)   default(0.0), not null
#  type                     :string(255)      default("Issue"), not null
#  remote_type              :string(255)
#  priority                 :string(255)
#  milestone                :string(255)
#  can_add_bounty           :boolean          default(FALSE), not null
#  accepted_bounty_claim_id :integer
#  author_name              :string(255)
#  owner                    :string(255)
#  paid_out                 :boolean          default(FALSE), not null
#  participants_count       :integer
#  thumbs_up_count          :integer
#  votes_count              :integer
#  watchers_count           :integer
#  severity                 :string(255)
#  delta                    :boolean          default(TRUE), not null
#  author_linked_account_id :integer
#  solution_started         :boolean          default(FALSE), not null
#  body_markdown            :text
#  deleted_at               :datetime
#  category                 :integer
#
# Indexes
#
#  index_issues_on_comment_count                  (comment_count)
#  index_issues_on_delta                          (delta)
#  index_issues_on_featured                       (featured)
#  index_issues_on_remote_id                      (remote_id)
#  index_issues_on_solution_started               (solution_started)
#  index_issues_on_tracker_id_and_bounty_total    (tracker_id,bounty_total)
#  index_issues_on_type                           (type)
#  index_issues_on_url                            (url) UNIQUE
#  index_issues_on_votes_count                    (votes_count)
#  index_issues_on_watchers_count                 (watchers_count)
#  index_issues_partial_author_linked_account_id  (author_linked_account_id) WHERE (author_linked_account_id IS NOT NULL)
#  index_issues_partial_bounty_total              (bounty_total) WHERE (bounty_total > (0)::numeric)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count) WHERE (COALESCE(thumbs_up_count, 0) > 0)
#

class PhpTracker::Issue < ::Issue
  belongs_to :tracker, class_name: "PhpTracker::Tracker", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    remote_sync(options) if synced_at.nil? || synced_at < 30.minutes.ago
  end

  def remote_sync(options={})
    doc = Nokogiri::HTML(HTTParty.get(url))

    updates = { synced_at: Time.now }
    updates[:number] = url.match(/id=(\d+)/)[1].to_i
    updates[:title] = doc.css("#summary").text
    updates[:state] = doc.css("#categorization td").first.text
    updates[:can_add_bounty] = self.class.status_to_can_add_bounty(updates[:state])

    # first comment is body
    comments = doc.css('.type_comment').each_with_index.map do |comment, index|
      {
        remote_id: index,
        created_at: Time.at(comment.css('a').attr('name').text.to_i),
        author_name: comment.css('strong').text.match(/\] (.*)/)[1],
        body_html: comment.css('pre').inner_html.gsub("\n","<br/>")
      }
    end
    updates[:body] = comments[0][:body_html]

    updates[:remote_created_at] = comments[0][:created_at]

    updated_at = doc.css('#submission td')[1].text
    updates[:remote_updated_at] = Time.parse(updated_at) unless updated_at == '-'

    updates[:author_name] = comments[0][:author_name]

    updates[:votes_count] = doc.css('#votes td')[0].text.to_i if doc.css('#votes').count > 0

    # do updates
    update_attributes!(updates)

    # sync comments (other than first which is body)
    sync_comments_from_array(comments[1..-1])
  end

  def self.status_to_can_add_bounty(status)
    [
      "Open",
      #"Closed",
      #"Duplicate",
      "Critical",
      "Assigned",
      "Not Assigned",
      "Analyzed",
      "Verified",
      #"Suspended",
      #"Wont fix",
      "No Feedback",
      "Feedback",
      "Old Feedback",
      "Stale",
      "Fresh",
      #"Not a bug",
      #"Spam"
    ].include?(status)
  end

end
