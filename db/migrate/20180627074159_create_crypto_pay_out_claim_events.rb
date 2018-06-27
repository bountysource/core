class CreateCryptoPayOutClaimEvents < ActiveRecord::Migration[5.1]
  def change
    create_table :crypto_pay_out_claim_events do |t|
      t.string :type
      t.reference :crypto_pay_out

      t.timestamps
    end
  end
end
