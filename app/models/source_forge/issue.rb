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
#  index_issues_partial_author_linked_account_id  (author_linked_account_id)
#  index_issues_partial_bounty_total              (bounty_total)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count)
#

class SourceForge::Issue < ::Issue
  belongs_to :tracker, class_name: "SourceForge::Tracker", foreign_key: :tracker_id

  # SYNCING INSTANCE METHODS, OVERRIDE THESE AS NECESSARY
  def remote_sync_if_necessary(options={})
    remote_sync(options) if synced_at.nil? || synced_at < 30.minutes.ago
  end

  def remote_sync(options={})
    # this helps with an issue doing lots of synced_at's at the same time
    update_attributes!(synced_at: Time.now) unless new_record?

    # uses optionally passed in HTML or does it's own HTTP get
    data = SourceForge::API.fetch_issue(url: url)

    # create or update issue
    ActiveRecord::Base.transaction do
      comments_info = data.delete(:comments)
      update_attributes!(data.merge(synced_at: Time.now))
      sync_comments_from_array(comments_info)
    end
  end

end
