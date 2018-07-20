# == Schema Information
#
# Table name: crypto_pay_out_txns
#
#  id                :bigint(8)        not null, primary key
#  crypto_pay_out_id :bigint(8)
#  state             :string
#  txn_hash          :string
#  confirmed_block   :integer
#  mined_at          :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  type              :string
#  gas_price_gwei    :decimal(10, 2)
#  gas_used          :integer
#
# Indexes
#
#  index_crypto_pay_out_txns_on_confirmed_block    (confirmed_block)
#  index_crypto_pay_out_txns_on_crypto_pay_out_id  (crypto_pay_out_id)
#  index_crypto_pay_out_txns_on_state              (state)
#  index_crypto_pay_out_txns_on_txn_hash           (txn_hash) UNIQUE
#

require 'test_helper'

class CryptoPayOutTxnTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
