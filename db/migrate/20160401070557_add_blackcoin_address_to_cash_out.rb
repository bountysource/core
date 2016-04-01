class AddBlackcoinAddressToCashOut < ActiveRecord::Migration
  def change
    add_column :cash_outs, :blackcoin_address, :string
    add_index :cash_outs, :blackcoin_address
  end
end
