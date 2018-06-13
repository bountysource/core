class AddRemoteIdToLinkedAccounts < ActiveRecord::Migration[5.1]
  def change
    add_column :linked_accounts, :remote_id, :string
  end
end
