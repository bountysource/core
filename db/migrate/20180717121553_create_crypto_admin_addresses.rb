class CreateCryptoAdminAddresses < ActiveRecord::Migration[5.1]
  def change
    create_table :crypto_admin_addresses do |t|
      t.string :public_address, null: false
      t.string :type, null: false

      t.timestamps
    end

    add_index :crypto_admin_addresses, :public_address, unique: true
  end
end
