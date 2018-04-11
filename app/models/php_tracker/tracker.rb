# == Schema Information
#
# Table name: trackers
#
#  id                   :integer          not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  remote_id            :integer
#  url                  :string(255)      not null
#  name                 :string(255)      not null
#  full_name            :string(255)
#  is_fork              :boolean          default(FALSE)
#  watchers             :integer          default(0), not null
#  forks                :integer          default(0)
#  pushed_at            :datetime
#  description          :text
#  featured             :boolean          default(FALSE), not null
#  open_issues          :integer          default(0), not null
#  synced_at            :datetime
#  project_tax          :decimal(9, 4)    default(0.0)
#  has_issues           :boolean          default(TRUE), not null
#  has_wiki             :boolean          default(FALSE), not null
#  has_downloads        :boolean          default(FALSE), not null
#  private              :boolean          default(FALSE), not null
#  homepage             :string(255)
#  sync_in_progress     :boolean          default(FALSE), not null
#  bounty_total         :decimal(10, 2)   default(0.0), not null
#  account_balance      :decimal(10, 2)   default(0.0)
#  type                 :string(255)      default("Tracker"), not null
#  cloudinary_id        :string(255)
#  closed_issues        :integer          default(0), not null
#  delta                :boolean          default(TRUE), not null
#  can_edit             :boolean          default(TRUE), not null
#  repo_url             :text
#  rank                 :integer          default(0), not null
#  remote_cloudinary_id :string(255)
#  remote_name          :string(255)
#  remote_description   :text
#  remote_homepage      :string(255)
#  remote_language_ids  :integer          default([]), is an Array
#  language_ids         :integer          default([]), is an Array
#  team_id              :integer
#  deleted_at           :datetime
#  issues_count         :integer          default(0)
#
# Indexes
#
#  index_trackers_on_bounty_total   (bounty_total)
#  index_trackers_on_closed_issues  (closed_issues)
#  index_trackers_on_delta          (delta)
#  index_trackers_on_open_issues    (open_issues)
#  index_trackers_on_rank           (rank)
#  index_trackers_on_remote_id      (remote_id)
#  index_trackers_on_team_id        (team_id)
#  index_trackers_on_type           (type)
#  index_trackers_on_url            (url) UNIQUE
#  index_trackers_on_watchers       (watchers)
#

class PhpTracker::Tracker < ::Tracker

  has_many :issues, class_name: "PhpTracker::Issue", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    if synced_at.nil?
      remote_sync(options)
    elsif synced_at < 1.hour.ago
      delay.remote_sync(options)
    end
  end

  def remote_sync(options={})
    update_attributes!(synced_at: Time.now)

    search_url = "#{url}search.php?cmd=display&direction=DESC&limit=10000&begin=0"
    doc = Nokogiri::HTML(HTTParty.get(search_url))

    doc.css('.content table tr').to_a.in_groups_of(100, false).each do |group|
      # load issues 100 at a time
      urls = []
      group.each do |tr|
        next unless tr.css('a').count == 4 # skip headers
        urls << File.join(self.url, tr.css('td')[0].css('a').attr('href').text)
      end
      issue_cache = Issue.where(url: urls)

      group.each do |tr|
        next unless tr.css('a').count == 4 # skip headers
        issue_url = File.join(self.url, tr.css('td')[0].css('a').attr('href').text)
        issue = issue_cache.find { |i| i.url == issue_url } || self.issues.new(url: issue_url)
        issue.number = tr.css('td')[0].css('a')[0].text.to_i
        issue.title = tr.css('td')[8].text
        issue.state = tr.css('td')[5].text
        issue.can_add_bounty = PhpTracker::Issue.status_to_can_add_bounty(issue.state)

        # seconds are truncated... don't override more accurate times if we have 'em
        remote_created_at = Time.parse(tr.css('td')[1].text)
        issue.remote_created_at = remote_created_at unless issue.remote_created_at && issue.remote_created_at > remote_created_at
        unless tr.css('td')[2].text == 'Not modified'
          remote_updated_at = Time.parse(tr.css('td')[2].text)
          issue.remote_updated_at = remote_updated_at unless issue.remote_updated_at && issue.remote_updated_at > remote_updated_at
        end

        # save it
        issue.save! if issue.changed?
      end
    end

    return self
  end

end
