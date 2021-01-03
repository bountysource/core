# == Schema Information
#
# Table name: quickbooks_transactions
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class QuickbooksTransaction < QuickbooksBase

  has_many :cash_outs

  def self.create_from_cash_out!(cash_out)
    response = self.api_call(
      path: "purchase",
      method: :post,
      post_body: post_body_from_cash_out(cash_out)
    )
    logger.error "RESPONSE #{response.inspect}"
    raise "Expected Purchase" unless response['Purchase']

    new.tap do |txn|
      txn.id = response['Purchase']['Id']
      txn.save!
    end
  end

  protected

  def self.post_body_from_cash_out(cash_out)
    account_ref = case cash_out.class.name
    when 'CashOut::Paypal' then { "value"=>"103" }
    when 'CashOut::Bitcoin' then { "value"=>"147" }
    when 'CashOut::Check' then { "value"=>"63" }
    when 'CashOut::Ripple' then { "value"=>"151" }
    else raise "Unknown account for #{cash_out.class.name}"
    end

    {
      "TxnDate" => cash_out.sent_at.to_date.to_s,
      "AccountRef" => account_ref,
      "PrivateNote" => "Cash out ##{cash_out.id}",
      "EntityRef" => {"value"=>"#{cash_out.person.quickbooks_vendor_id}", "type"=>"Vendor"},
      "PaymentType" => "Check",
      #"PrintStatus" => "NeedToPrint",
      "Line" => [
        {
          "Amount" => cash_out.final_payment_amount,
          "Description" => "Cash out ##{cash_out.id}",
          "DetailType" => "AccountBasedExpenseLineDetail",
          "AccountBasedExpenseLineDetail" => {
            "AccountRef" => { "value" => "158", "name"=>"Developer Payments" }
          }
        }
      ]
    }
  end
end
