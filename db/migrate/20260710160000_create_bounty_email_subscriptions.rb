class CreateBountyEmailSubscriptions < ActiveRecord::Migration[5.0]
  def change
    create_table :bounty_email_subscriptions do |t|
      t.integer  :person_id, null: false
      t.string   :name, null: false
      t.string   :query, null: false, default: ""
      t.decimal  :min_amount, precision: 10, scale: 2, default: 0, null: false
      t.string   :tracker_name
      t.string   :language
      t.boolean  :active, default: true, null: false
      t.datetime :last_notified_at
      t.timestamps null: false
    end

    add_index :bounty_email_subscriptions, :person_id
    add_index :bounty_email_subscriptions, [:person_id, :active]
  end
end
