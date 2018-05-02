class CreateWallets < ActiveRecord::Migration[5.1]
  def change
    create_table :wallets do |t|
      t.integer :person_id, null: false
      t.string :label
      t.string :eth_addr, null: false

      t.timestamps
    end
  end
end
