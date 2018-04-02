class CreateQuickbooksTransactions < ActiveRecord::Migration[5.0]
  def up
    create_table :quickbooks_transactions, id: false do |t|
      t.integer :id
      t.timestamps
    end
    execute "ALTER TABLE quickbooks_transactions ADD PRIMARY KEY (id);"
  end

  def down
    drop_table :quickbooks_transactions
  end
end
