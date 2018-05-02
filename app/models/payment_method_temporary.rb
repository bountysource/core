# == Schema Information
#
# Table name: payment_method_temporaries
#
#  id           :integer          not null, primary key
#  person_id    :integer          not null
#  paypal_token :string(255)      not null
#  data         :json             not null
#  created_at   :datetime
#  updated_at   :datetime
#
# Indexes
#
#  index_payment_method_temporaries_on_paypal_token  (paypal_token)
#

class PaymentMethodTemporary < ApplicationRecord
  belongs_to :person
end
