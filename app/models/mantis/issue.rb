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

class Mantis::Issue < ::Issue
  attr_accessible :state, :number, :severity, :priority

  belongs_to :tracker, class_name: "Mantis::Tracker", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    remote_sync(options) if synced_at.nil? || synced_at < 30.minutes.ago
  end

  def remote_sync(options={})
    # print view
    doc = Nokogiri::HTML(HTTParty.get(url.gsub('view.php?id=', 'print_bug_page.php?bug_id=')))

    updates = { synced_at: Time.now }
    updates[:number] = url.match(/view\.php\?id=(\d+)/)[1].to_i
    updates[:title] = doc.css('td.print-category:contains("Summary")').first.next_element.text.gsub(/^\d+: /,'')
    updates[:state] = doc.css('td.print-category:contains("Status")').first.next_element.text
    updates[:severity] = doc.css('td.print-category:contains("Severity")').first.next_element.text
    updates[:priority] = doc.css('td.print-category:contains("Priority")').first.next_element.text
    updates[:can_add_bounty] = self.class.can_add_bounty_from_state(updates[:state])
    updates[:author_name] = doc.css('td.print-category:contains("Reporter")').first.next_element.text

    body = ""
    ['Description', 'Steps To Reproduce', 'Additional Information'].each do |section|
      tmp_text = doc.css("td.print-category:contains(\"#{section}\")").first.next_element.inner_html
      body += "<h1>#{section}</h1>#{tmp_text}" unless tmp_text.blank?
    end
    updates[:body] = body

    td = doc.css('td.print:contains("Date Submitted")').first
    idx = td.parent.children.find_index(td)
    txt = td.parent.next_element.children[idx].text
    updates[:remote_created_at] = Time.strptime(txt, '%d-%m-%y %k:%M')


    td = doc.css('td.print:contains("Last Update")').first
    idx = td.parent.children.find_index(td)
    txt = td.parent.next_element.children[idx].text
    updates[:remote_updated_at] = Time.strptime(txt, '%d-%m-%y %k:%M')

    # do updates
    update_attributes!(updates)

    # sync comments
    comments = doc.css('td.nopad[width="20%"]').map do |td|
      {
        remote_id: td.css('td')[0].text.gsub(/[^\d]/,''),
        author_name: td.css('td')[1].text.gsub(/[^a-zA-Z0-9]/,''),
        created_at: Time.parse(td.css('td')[2].text),
        body_html: td.next_element.css('td').inner_html
      }
    end
    sync_comments_from_array(comments)
  end

  def self.can_add_bounty_from_state(state)
    !%w(closed resolved).include?(state)
  end

end
