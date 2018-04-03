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

class Mantis::Tracker < ::Tracker

  MAX_RESULT_PER_PAGE = 50

  has_many :issues, class_name: "Mantis::Issue", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    if synced_at.nil?
      remote_sync(options)
    elsif synced_at < 1.hour.ago
      delay.remote_sync(options)
    end
  end

  def remote_sync(options={})
    update_attributes!(synced_at: Time.now)

    response = HTTParty.get(url + "csv_export.php").body

    csv = CSV.parse(response, {headers: true, :header_converters => :symbol})

    url_from_id = lambda { |id| url + "view.php?id=#{id.to_i}" }

    issue_cache = ::Issue.where(url: csv.map { |row| url_from_id.call(row[:id]) } )

    puts issue_cache.map(&:url)
    csv.each do |row|
      #puts row.inspect
      issue_url = url_from_id.call(row[:id])
      issue = issue_cache.find { |i| i.url == issue_url } || self.issues.new(url: issue_url)
      #puts issue.inspect

      issue.type = 'Mantis::Issue'
      issue.tracker = self
      issue.number = row[:id].to_i
      issue.title = row[:summary]
      issue.state = row[:status]
      issue.can_add_bounty = Mantis::Issue.can_add_bounty_from_state(row[:status])
      issue.severity = row[:severity]
      issue.priority = row[:priority]

      # this comes back as just a date, not a date+time.. ugh.
      created = Time.parse(row[:date_submitted])
      issue.remote_created_at = created if !issue.remote_created_at || created > issue.remote_created_at
      updated = Time.parse(row[:updated])
      issue.remote_updated_at = updated if !issue.remote_updated_at || updated > issue.remote_updated_at

      # puts "BEFORE SAVE"
      # puts issue.inspect
      issue.save!
    end
  end

end
