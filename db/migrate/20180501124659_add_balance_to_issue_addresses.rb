class AddBalanceToIssueAddresses < ActiveRecord::Migration[5.1]
  def change
    add_column :issue_addresses, :balance_updated_at, :datetime
    add_column :issue_addresses, :balance, :jsonb
  end
end
