class ChangeColumnsInCryptoPayOuts < ActiveRecord::Migration[5.1]
  def change
    add_column :crypto_pay_outs, :seed_eth, :numeric
    remove_column :crypto_pay_outs, :amount, :jsonb
    add_column :crypto_pay_outs, :balance, :jsonb
    add_column :crypto_pay_outs, :bounty, :jsonb
  end
end
