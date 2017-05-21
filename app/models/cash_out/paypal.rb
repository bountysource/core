# == Schema Information
#
# Table name: cash_outs
#
#  id                         :integer          not null, primary key
#  type                       :string(255)      not null
#  person_id                  :integer          not null
#  address_id                 :integer          not null
#  mailing_address_id         :integer
#  bitcoin_address            :string(255)
#  paypal_address             :string(255)
#  remote_ip                  :string(255)
#  user_agent                 :string(255)
#  amount                     :decimal(, )
#  sent_at                    :datetime
#  us_citizen                 :boolean
#  created_at                 :datetime
#  updated_at                 :datetime
#  serialized_address         :text
#  serialized_mailing_address :text
#  fee                        :decimal(, )
#  fee_adjustment             :decimal(, )
#  ripple_address             :string(255)
#  mastercoin_address         :string(255)
#  is_refund                  :boolean          default(FALSE), not null
#  account_id                 :integer          not null
#  approved_at                :datetime
#  batch_id                   :string(255)
#
# Indexes
#
#  index_cash_outs_on_address_id          (address_id)
#  index_cash_outs_on_amount              (amount)
#  index_cash_outs_on_bitcoin_address     (bitcoin_address)
#  index_cash_outs_on_mailing_address_id  (mailing_address_id)
#  index_cash_outs_on_paypal_address      (paypal_address)
#  index_cash_outs_on_person_id           (person_id)
#  index_cash_outs_on_sent_at             (sent_at)
#  index_cash_outs_on_type                (type)
#  index_cash_outs_on_us_citizen          (us_citizen)
#

class CashOut::Paypal < CashOut

  validates :paypal_address, presence: true

  # Send the cash out asyncronously via PayPal's Payout API
  def send!
    @payout = Payout.new(
      {
        :sender_batch_header => {
          :sender_batch_id => SecureRandom.hex(8),
          :email_subject => 'You have a Payout!',
        },
        :items => [
          {
            :recipient_type => 'EMAIL',
            :amount => {
              :value => amount,
              :currency => 'USD'
            },
            :note => 'Thanks!',
            :receiver => paypal_address,
            :sender_item_id => id,
          }
        ]
      }
    )

    begin
      @payout_batch = @payout.create
      logger.info "Created Payout with [#{@payout_batch.batch_header.payout_batch_id}]"
    rescue ResourceNotFound => err
      logger.error @payout.error.inspect
    end
  end

end
