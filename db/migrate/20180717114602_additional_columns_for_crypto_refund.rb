class AdditionalColumnsForCryptoRefund < ActiveRecord::Migration[5.1]
  def up
    add_column :crypto_bounties, :is_refund, :boolean, default: false, null: false
    add_column :crypto_pay_outs, :transaction_hash, :string
    add_index  :crypto_pay_outs, :transaction_hash, unique: true
  end

  def down
    remove_index  :crypto_pay_outs, :transaction_hash
    remove_column :crypto_pay_outs, :transaction_hash, :string
    remove_column :crypto_bounties, :is_refund, :boolean, default: false, null: false
  end
end
