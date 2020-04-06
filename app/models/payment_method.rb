# == Schema Information
#
# Table name: payment_methods
#
#  id         :integer          not null, primary key
#  type       :string(255)      not null
#  person_id  :integer          not null
#  data       :json             not null
#  created_at :datetime
#  updated_at :datetime
#

class PaymentMethod < ApplicationRecord
  has_account class_name: 'Account::PaymentMethod'
  has_many :notifications, class_name: 'PaymentNotification', foreign_key: :payment_method_id

  belongs_to :person
  has_many :shopping_carts
  has_many :support_levels

  def self.default_invoicing_period
    # we explicitly run Time.now only once so if queries take a few seconds right at midnight, dates don't shift on us
    now = Time.now
    {
      older_than: now,
      today: now.to_date,
      this_month_starts_on: now.to_date.beginning_of_month,
      this_month_ends_on: now.to_date.end_of_month,
      last_month_starts_on: (now.to_date - 1.month).beginning_of_month,
      last_month_ends_on: (now.to_date - 1.month).end_of_month
    }
  end

  # used by cron
  def self.create_and_settle_all_pending_invoices!
    create_all_pending_invoices!
    settle_all_pending_invoices!
  end

  # this method is idempotent, run it as many times as you'd like!
  def self.create_all_pending_invoices!
    # compute invoice period and then reuse this for each pending invoice
    invoicing_period = default_invoicing_period

    # get the payment methods which need to be invoiced
    payment_method_ids_query = SupportLevel.needs_to_be_invoiced(invoicing_period).select('distinct payment_method_id')

    # loop through each payment method and figure out which support levels need to be invoiced
    PaymentMethod.where("id in (#{payment_method_ids_query.to_sql})").find_each(batch_size: 100) do |payment_method|
      payment_method.create_pending_invoices!(invoicing_period)
    end
  end

  def self.settle_all_pending_invoices!
    payment_method_ids_query = ShoppingCart.ready_to_be_billed.select('distinct payment_method_id')

    # loop through each payment method and figure out which support levels need to be invoiced
    PaymentMethod.where("id in (#{payment_method_ids_query.to_sql})").find_each(batch_size: 100) do |payment_method|
      payment_method.settle_pending_invoices!
    end
  end



  def create_and_settle_pending_invoices!
    create_pending_invoices!
    settle_pending_invoices!
  end

  def create_pending_invoices!(invoicing_period=nil)
    # allow invoicing period to be passed in
    invoicing_period ||= self.class.default_invoicing_period

    # build a shopping cart
    shopping_cart = person.shopping_carts.new(payment_method: self, items: [])

    # figure out what support levels need to be billed
    support_levels.needs_to_be_invoiced(invoicing_period).each do |support_level|
      # if it's a new support level, we're billing for the current month, otherwise it's last month
      if support_level.last_invoice_ends_at
        period_starts_at = invoicing_period[:last_month_starts_on]
        period_ends_at = invoicing_period[:last_month_ends_on]
      else
        period_starts_at = invoicing_period[:this_month_starts_on]
        period_ends_at = invoicing_period[:this_month_ends_on]
      end

      # race condition prevention... if the update succeds, we know we got an exclusive lock
      if SupportLevel.where(id: support_level.id, last_invoice_ends_at: support_level.last_invoice_ends_at).update_all(last_invoice_starts_at: period_starts_at, last_invoice_ends_at: period_ends_at)
        amount_due = support_level.amount
        amount_due -= support_level.payments.where(period_starts_at: period_starts_at, period_ends_at: period_ends_at).sum(:amount)

        # if anything is owed,
        if amount_due > 0
          shopping_cart.items << {
            item_type: 'support_level_payment',
            support_level_id: support_level.id,
            amount: amount_due,
            period_starts_at: period_starts_at,
            period_ends_at: period_ends_at
          }
        end
      end
    end

    # if we have support levels that need invoicing, do it here
    shopping_cart.status = 'open'
    shopping_cart.save! if shopping_cart.items.length > 0
  end

  # this method is idempotent, run it as many times as you'd like!
  def settle_pending_invoices!
    # find carts that need to be billed, and increment the billing attempts
    carts = shopping_carts.ready_to_be_billed
    return unless carts.exists?

    # any existing credits to apply?
    amount_due = carts.to_a.sum(&:calculate_gross_money)
    amount_due -= reload.account_balance_money

    # if charges are needed
    if amount_due > 0
      # $5.00 minimum charge
      amount_to_charge = [amount_due, Money.new(500, 'USD')].max

      # capture funds.. if successful, credit the payment_methods account so the logic below works
      notification = charge(amount_to_charge)

      # credit the internal account
      if notification.success?
        transaction = notification.class.order_class.create!(
          description: "#{self.class.name} Transaction: $#{notification.amount.to_f} - #{notification.txn_id}",
          audited: true,
          person: self.person
        )
        self.account = reload.account||create_account
        transaction.splits.create!(item: notification, account: account, amount: notification.amount)
        transaction.splits.create!(item: notification, account: Account::Liability.instance, amount: -notification.amount)
      end
    end

    # charges may have gone through, so see if we can close out any invoices
    carts.each do |shopping_cart|
      if shopping_cart.calculate_gross_money <= reload.account_balance_money
        # YAY! fulfill order
        Transaction::Order.create_from_cart_and_checkout_method(shopping_cart, self.account, dont_touch_cart: true)
        support_level_status = 'active' # updated below
      else
        # BOO, payment failed, sucks for everybody.
        shopping_cart.status = 'unpaid'
        shopping_cart.save!
        support_level_status = 'unpaid' # updated below
      end

      # update support levels appropraiately
      shopping_cart.items.each do |item|
        shopping_cart.person.support_levels.find_by(id: item['support_level_id'])!.update_attributes!(status: support_level_status)
      end

      # send emails
      if support_level_status == 'active'
        person.send_email(:order_created, shopping_cart_id: shopping_cart.id, payment_notification_id: (notification ? notification.id : nil))
      else
        person.send_email(:order_failed, shopping_cart_id: shopping_cart.id, payment_notification_id: notification.id)
      end
    end

  rescue Exception => e
    # catch all...
    NewRelic::Agent.notice_error(e)
    Rails.logger.error "EXCEPTION: #{e.inspect} #{e.backtrace.inspect}"
    raise if Rails.env.test?
  end

end
