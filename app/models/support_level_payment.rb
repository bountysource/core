# == Schema Information
#
# Table name: support_level_payments
#
#  id               :integer          not null, primary key
#  support_level_id :integer          not null
#  amount           :decimal(10, 2)   not null
#  period_starts_at :date
#  period_ends_at   :date
#  created_at       :datetime
#  updated_at       :datetime
#  refunded_at      :datetime
#
# Indexes
#
#  index_support_level_payments_on_support_level_id  (support_level_id)
#

class SupportLevelPayment < ActiveRecord::Base

  attr_accessible :amount, :support_level, :support_level_id, :period_starts_at, :period_ends_at, :refunded_at

  # used in app/views/v1/transactions/items/support_level_payment.rabl to simulate TeamPayin
  delegate :owner, to: :support_level
  delegate :team, to: :support_level

  belongs_to :support_level

  scope :not_refunded, lambda { where(refunded_at: nil) }
  scope :created_this_month, lambda { |period=Time.now| not_refunded.where(created_at: (period.beginning_of_month+1.day)..(period.end_of_month+1.day)) }


  after_create do
    support_level.update_attributes!(status: 'active')
  end

  # this is stupid... shopping cart stuff is so wacky
  def account
    support_level.team.account || support_level.team.create_account
  end

  # takes money out of the account
  def refund!
    update_attributes!(refunded_at: Time.now)

    transaction = Transaction::Refund.create!(
      audited: false,
      person: support_level.person,
      description: "Refund for SupportLevelPayment ##{self.id}"
    )

    transaction.splits.create!(
      amount: -1.0 * self.amount,
      account: self.account,
      item: self
    )

    transaction.splits.create!(
      amount: self.amount,
      account: Account::Liability.instance,
      item: self
    )

  end

end
