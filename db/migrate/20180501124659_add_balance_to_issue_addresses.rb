class AddBalanceToIssueAddresses < ActiveRecord::Migration[5.1]
  def change
    add_column :issues_addresses, :balance_updated_at, :datetime
    add_column :issues_addresses, :balance, :jsonb
  end
end
