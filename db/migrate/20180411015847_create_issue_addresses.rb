class CreateIssueAddresses < ActiveRecord::Migration[5.1]
  def change
    create_table :issue_addresses do |t|
      t.references :issue, foreign_key: true
      t.string :public_address
      t.string :private_key

      t.timestamps
    end
  end
end
