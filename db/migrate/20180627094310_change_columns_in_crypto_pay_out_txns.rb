class ChangeColumnsInCryptoPayOutTxns < ActiveRecord::Migration[5.1]
  def change
    add_column :crypto_pay_out_txns, :type, :string
    remove_column :crypto_pay_out_txns, :fee_txn, :boolean
  end
end
