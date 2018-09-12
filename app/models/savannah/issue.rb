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

class Savannah::Issue < ::Issue
  belongs_to :tracker, class_name: "Savannah::Tracker", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    remote_sync(options) if synced_at.nil? || synced_at < 30.minutes.ago
  end

  def remote_sync(options={})
    doc = Nokogiri::HTML(HTTParty.get(url))

    updates = { synced_at: Time.now }
    updates[:number] = url.match(/\?(\d+)/)[1].to_i
    updates[:title] = doc.css('h2')[1].text.gsub(/\Abug #\d+: /,'')

    box_hash = {}
    tds = doc.css('form[name=item_form] table:first td')
    tds.each_with_index { |td,index| box_hash[td.text[0..-3]] = tds[index+1].text if td.text.ends_with?(":\u00a0") }
    updates[:state] = box_hash['Status']
    updates[:can_add_bounty] = box_hash['Open/Closed'] == 'Open'

    # first comment is body
    comments = doc.css('#hidsubpartcontentdiscussion table tr').reverse.map { |tr|
      next if tr.text.blank?
      {
        remote_id: (tr.css('a:first').text.match(/comment #(\d+)/)[1].to_i rescue nil),
        created_at: Time.parse(tr.css('td:first a:first').text.gsub(/,.*/,'')),
        author_name: tr.css('td:last').text,
        body_html: tr.css('td:first').inner_html.gsub("\r","\n").gsub(/\A<a.*?<\/a><br>/,'').gsub(/<textarea/,'<pre').gsub(/<\/textarea/,'</pre')
      }
    }.compact
    updates[:body] = comments[0][:body_html]
    updates[:remote_created_at] = comments[0][:created_at]
    updates[:author_name] = comments[0][:author_name]
    puts comments.inspect

    # do updates
    update_attributes!(updates)

    # sync comments (other than first which is body)
    sync_comments_from_array(comments[1..-1])
  end

end
