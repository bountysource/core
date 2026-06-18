class CreateBountySubscriptions < ActiveRecord::Migration[5.1]
  def change
    create_table :bounty_subscriptions do |t|
      t.references :person,      null: false, foreign_key: true
      t.string     :email,       null: false
      t.text       :keywords
      t.decimal    :min_bounty_amount, precision: 10, scale: 2
      t.string     :language
      t.integer    :tracker_id
      t.string     :frequency,   null: false, default: 'daily'
      t.boolean    :active,      null: false, default: true
      t.datetime   :last_checked_at
      t.timestamps
    end

    add_index :bounty_subscriptions, :active
    add_index :bounty_subscriptions, :frequency
    add_foreign_key :bounty_subscriptions, :trackers, column: :tracker_id
  end
end
