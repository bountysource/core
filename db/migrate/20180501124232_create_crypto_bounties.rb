class CreateCryptoBounties < ActiveRecord::Migration[5.1]
  def change
    create_table :crypto_bounties do |t|
      t.jsonb :amount, null: false
      t.references :issue, foreign_key: true
      t.string :status, limit: 12, default: 'active', null: false
      t.boolean :anonymous, default: false, null: false
      t.references :owner, polymorphic: true
      t.boolean :featured, default: false, null: false
      t.string :transaction_hash, null: false

      t.timestamps
    end
  end
end
