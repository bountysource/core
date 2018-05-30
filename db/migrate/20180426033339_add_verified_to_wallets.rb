class AddVerifiedToWallets < ActiveRecord::Migration[5.1]
  def change
    add_column :wallets, :verified, :boolean, default: false
    add_column :wallets, :primary, :boolean, default: false
    add_index :wallets, :person_id
  end
end
