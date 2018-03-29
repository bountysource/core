class AddIsFraudToCashOuts < ActiveRecord::Migration[5.0]
  def change
    add_column :cash_outs, :is_fraud, :boolean, null: false, default: false
  end
end
