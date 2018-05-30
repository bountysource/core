class AddUniqueIndexToIssueAddressAndBounties < ActiveRecord::Migration[5.1]
  def change
    remove_index :issue_addresses, :public_address
    add_index :issue_addresses, :public_address, unique: true
    add_index :crypto_bounties, :transaction_hash, unique: true
  end
end
