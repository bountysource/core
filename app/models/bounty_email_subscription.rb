# == Schema Information
#
# Table name: bounty_email_subscriptions
#
#  id               :integer          not null, primary key
#  person_id        :integer          not null
#  name             :string           not null
#  query            :string           default(""), not null
#  min_amount       :decimal(10, 2)   default(0.0), not null
#  tracker_name     :string
#  language         :string
#  active           :boolean          default(TRUE), not null
#  last_notified_at :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_bounty_email_subscriptions_on_person_id             (person_id)
#  index_bounty_email_subscriptions_on_person_id_and_active  (person_id, active)
#

# Email alert when a new (or increased) bounty matches saved search criteria.
# Implements https://github.com/bountysource/core/issues/1141
class BountyEmailSubscription < ApplicationRecord
  belongs_to :person

  validates :person, presence: true
  validates :name, presence: true, length: { maximum: 120 }
  validates :query, length: { maximum: 500 }, allow_blank: true
  validates :min_amount, numericality: { greater_than_or_equal_to: 0 }
  validates :tracker_name, length: { maximum: 200 }, allow_blank: true
  validates :language, length: { maximum: 80 }, allow_blank: true

  scope :active, -> { where(active: true) }

  # Does this bounty/issue match the subscription criteria?
  def matches?(bounty)
    return false unless bounty && bounty.issue
    return false if min_amount.to_f > 0 && bounty.amount.to_f < min_amount.to_f

    issue = bounty.issue
    haystack = [
      issue.title,
      issue.body.to_s,
      (issue.tracker.try(:name) || ""),
      (issue.tracker.try(:full_name) || "")
    ].join(" ").downcase

    if query.present?
      tokens = query.to_s.downcase.split(/\s+/).reject(&:blank?)
      return false unless tokens.all? { |t| haystack.include?(t) }
    end

    if tracker_name.present?
      tname = (issue.tracker.try(:name) || "").downcase
      full = (issue.tracker.try(:full_name) || "").downcase
      needle = tracker_name.downcase
      return false unless tname.include?(needle) || full.include?(needle)
    end

    if language.present?
      langs = Array(issue.tracker.try(:languages)).map { |l| l.try(:name).to_s.downcase }
      return false unless langs.any? { |l| l.include?(language.downcase) }
    end

    true
  end

  # Notify all matching active subscriptions for a newly placed / increased bounty.
  def self.notify_matching_for_bounty!(bounty)
    return unless bounty && bounty.issue
    return if bounty.person_id.blank? && bounty.amount.to_f <= 0

    active.includes(:person).find_each do |sub|
      person = sub.person
      next unless person && person.email.present?
      next if person.id == bounty.person_id # don't email the poster
      next unless sub.matches?(bounty)

      person.send_email(
        :bounty_search_match,
        bounty: bounty,
        subscription: sub
      )
      sub.update_column(:last_notified_at, Time.current)
    end
  rescue => e
    Rails.logger.error("[BountyEmailSubscription] notify failed: #{e.class}: #{e.message}")
    NewRelic::Agent.notice_error(e) if defined?(NewRelic)
  end
end
