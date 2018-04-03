class AddQuickbooksColumns < ActiveRecord::Migration[5.0]
  def change
    add_column :people, :quickbooks_vendor_id, :integer
    add_column :cash_outs, :quickbooks_transaction_id, :integer
  end
end
