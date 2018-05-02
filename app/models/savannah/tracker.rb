# == Schema Information
#
# Table name: trackers
#
#  id                   :integer          not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  remote_id            :integer
#  url                  :string           not null
#  name                 :string           not null
#  full_name            :string
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
#  homepage             :string
#  sync_in_progress     :boolean          default(FALSE), not null
#  bounty_total         :decimal(10, 2)   default(0.0), not null
#  account_balance      :decimal(10, 2)   default(0.0)
#  type                 :string           default("Tracker"), not null
#  cloudinary_id        :string
#  closed_issues        :integer          default(0), not null
#  delta                :boolean          default(TRUE), not null
#  can_edit             :boolean          default(TRUE), not null
#  repo_url             :text
#  rank                 :integer          default(0), not null
#  remote_cloudinary_id :string
#  remote_name          :string
#  remote_description   :text
#  remote_homepage      :string
#  remote_language_ids  :integer          default([]), is an Array
#  language_ids         :integer          default([]), is an Array
#  team_id              :integer
#  deleted_at           :datetime
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

class Savannah::Tracker < ::Tracker

  MAX_RESULT_PER_PAGE = 50

  has_many :issues, class_name: "Savannah::Issue", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    if synced_at.nil?
      remote_sync(options)
    elsif synced_at < 1.hour.ago
      delay.remote_sync(options)
    end
  end

  def remote_sync(options={})
    update_attributes!(synced_at: Time.now)

    search_url = "#{url}&offset=#{options[:offset] || 0}"
    doc = Nokogiri::HTML(HTTParty.get(search_url))

    issue_hashes = doc.css('table.box tr').to_a[1..-1].map do |tr|
      retval = {}
      retval[:number] = tr.css('td')[0].text.gsub(/[^\d]/,'').to_i
      retval[:url] = "#{self.url.split('?')[0]}?#{retval[:number]}"
      retval[:title] = tr.css('td')[1].text
      retval[:remote_created_at] = Time.parse(tr.css('td')[4].text)
      retval[:state] = tr.css('td')[2].text
      retval[:can_add_bounty] = !tr.attr('class').include?('closed')
      retval
    end

    issue_cache = issues.where(url: issue_hashes.map { |h| h[:url] })
    issue_hashes.each do |hash|
      issue = issue_cache.find { |i| i.url == hash[:url] } || self.issues.new(url: hash[:url])
      issue.update_attributes!(hash)
    end

    unless options[:offset]
      offset = MAX_RESULT_PER_PAGE
      total_issues = doc.css('h3.nextprev').text.match(/(\d+) matching items/)[1].to_i
      while offset < total_issues
        (options[:force] ? self : delay).remote_sync(options.merge(offset: offset))
        offset += MAX_RESULT_PER_PAGE
      end
    end

    return self
  end

end
