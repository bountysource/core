class CreateTakedowns < ActiveRecord::Migration
  def change
    create_table :takedowns do |t|
      t.integer :linked_account_id, null: false
      t.timestamps
    end
  end
end
