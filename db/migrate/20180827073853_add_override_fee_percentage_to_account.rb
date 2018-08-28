class AddOverrideFeePercentageToAccount < ActiveRecord::Migration[5.1]
  def change
    add_column :accounts, :override_fee_percentage, :integer
  end
end
