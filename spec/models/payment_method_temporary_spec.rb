# == Schema Information
#
# Table name: payment_method_temporaries
#
#  id           :integer          not null, primary key
#  person_id    :integer          not null
#  paypal_token :string           not null
#  data         :json             not null
#  created_at   :datetime
#  updated_at   :datetime
#
# Indexes
#
#  index_payment_method_temporaries_on_paypal_token  (paypal_token)
#

require 'spec_helper'

describe PaymentMethodTemporary do
  pending "add some examples to (or delete) #{__FILE__}"
end
