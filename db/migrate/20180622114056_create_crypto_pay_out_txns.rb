class CreateCryptoPayOutTxns < ActiveRecord::Migration[5.1]
  def change
    create_table :crypto_pay_out_txns do |t|
      t.references :crypto_pay_out, index: true
      t.string :state, index: true
      t.string :txn_hash, index: { unique: true}
      t.boolean :fee_txn, index: true
      t.integer :confirmed_block, index: true
      t.datetime :mined_at

      t.timestamps
    end
  end
end
