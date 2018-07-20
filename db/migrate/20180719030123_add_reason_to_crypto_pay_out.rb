class AddReasonToCryptoPayOut < ActiveRecord::Migration[5.1]
  def change
    add_column :crypto_pay_outs, :reason, :string
  end
end
