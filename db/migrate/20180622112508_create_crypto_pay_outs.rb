class CreateCryptoPayOuts < ActiveRecord::Migration[5.1]
  def change
    create_table :crypto_pay_outs do |t|
      t.references :issue, index: { unique: true }
      t.references :person, index: true

      t.string  :type, limit: 255, null: false, index: true
      t.string  :state, limit: 255, index: true
      t.string  :receiver_address
      t.string  :funder_acct_address
      t.numeric :fee_percent
      t.jsonb   :fee
      t.string  :fees_acct_address
      t.jsonb   :amount    
      t.datetime :sent_at, index: true

      t.timestamps
    end
  end
end
