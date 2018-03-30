class CreateQuickbooksVendors < ActiveRecord::Migration[5.0]
  def up
    create_table :quickbooks_vendors, id: false do |t|
      t.integer :id
      t.string :name
      t.timestamps
    end
    execute "ALTER TABLE quickbooks_vendors ADD PRIMARY KEY (id);"
  end

  def down
    drop_table :quickbooks_vendors
  end
end
