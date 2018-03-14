class AddIsFraudToCashOuts < ActiveRecord::Migration
  def change
    add_column :cash_outs, :is_fraud, :boolean, null: false, default: false
  end
end
