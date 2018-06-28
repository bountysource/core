# == Schema Information
#
# Table name: crypto_pay_out_claim_events
#
#  id                :bigint(8)        not null, primary key
#  type              :string
#  crypto_pay_out_id :bigint(8)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_crypto_pay_out_claim_events_on_crypto_pay_out_id  (crypto_pay_out_id)
#

class CryptoPayOutClaimEvent < ApplicationRecord
  self.inheritance_column = nil
end
