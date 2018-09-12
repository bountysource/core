class AddRefundCryptoColumns < ActiveRecord::Migration[5.1]
  def change
    add_column :crypto_pay_outs, :is_refund, :boolean, default: false, null: false

    add_column :crypto_pay_out_txns, :gas_price_gwei, :decimal, precision: 10, scale: 2
    add_column :crypto_pay_out_txns, :gas_used, :integer
  end
end
