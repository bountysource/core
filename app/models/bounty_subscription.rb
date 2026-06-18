# == Schema Information
#
# Table name: bounty_subscriptions
#
#  id               :integer          not null, primary key
#  person_id        :integer          not null
#  email            :string           not null
#  keywords         :text
#  min_bounty_amount :decimal(10, 2)
#  language         :string
#  tracker_id       :integer
#  frequency        :string           not null, default('daily')
#  active           :boolean          not null, default(true)
#  last_checked_at  :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class BountySubscription < ApplicationRecord
  belongs_to :person
  belongs_to :tracker, optional: true

  validates :email, presence: true, format: { with: /\A[^@\s]+@[^@\s]+\z/ }
  validates :frequency, inclusion: { in: %w[instant daily weekly] }

  scope :active, -> { where(active: true) }
  scope :by_frequency, ->(freq) { where(frequency: freq) }

  def matches?(bounty)
    return false unless active?

    # Check tracker filter
    if tracker_id.present?
      return false unless bounty.issue.tracker_id == tracker_id
    end

    # Check minimum bounty amount
    if min_bounty_amount.present?
      return false unless bounty.amount.to_d >= min_bounty_amount.to_d
    end

    # Check keywords
    if keywords.present?
      kw_list = keywords.split(',').map(&:strip).reject(&:empty?)
      title_body = "#{bounty.issue.title} #{bounty.issue.body}".downcase
      return false unless kw_list.any? { |kw| title_body.include?(kw.downcase) }
    end

    # Check language
    if language.present?
      tracker_languages = bounty.issue.tracker.languages.pluck(:name)
      return false unless tracker_languages.any? { |l| l.downcase.include?(language.downcase) }
    end

    true
  end

  def matching_bounties(since:)
    Bounty
      .includes(issue: :tracker)
      .active
      .where('bounties.created_at >= ?', since)
      .select { |b| matches?(b) }
  end
end
