class AddDefaultToCryptoBounties < ActiveRecord::Migration[5.1]
  def change
    change_column :crypto_pay_outs, :state, :string, default: 'Pending-Approval'
  end
end
