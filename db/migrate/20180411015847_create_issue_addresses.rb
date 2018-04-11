class CreateIssueAddresses < ActiveRecord::Migration[5.0]
  def change
    create_table :issue_addresses do |t|
      t.references :issue, foreign_key: true
      t.string :public_address, limit: 255
      t.string :private_key, limit: 255

      t.timestamps
    end

    add_index :issue_addresses, :public_address
  end
end
