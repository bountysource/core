# == Schema Information
#
# Table name: payment_methods
#
#  id         :integer          not null, primary key
#  type       :string           not null
#  person_id  :integer          not null
#  data       :json             not null
#  created_at :datetime
#  updated_at :datetime
#

FactoryBot.define do
  factory :payment_method do
    association :person, factory: :person

    factory :payment_method_paypal, class: PaymentMethod::PaypalReferenceTransaction do
      data {
        {
          'EMAIL' => 'qa@bountysource.qa',
          'BILLINGAGREEMENTID' => 'B-090886401R781050M'
        }
      }
    end

    factory :payment_method_stripe, class: PaymentMethod::StripeCreditCard do
      data {
        {
          'id' => 'card_abcd1234'
        }
      }
    end
  end
end
