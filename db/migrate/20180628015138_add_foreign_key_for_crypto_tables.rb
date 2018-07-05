class AddForeignKeyForCryptoTables < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key :crypto_pay_out_claim_events, :crypto_pay_outs
    add_foreign_key :crypto_pay_out_txns, :crypto_pay_outs
    add_foreign_key :crypto_pay_outs, :issues
  end
end
