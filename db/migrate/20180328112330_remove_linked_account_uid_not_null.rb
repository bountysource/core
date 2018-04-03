class RemoveLinkedAccountUidNotNull < ActiveRecord::Migration[5.0]
  def change
    change_column_null :linked_accounts, :uid, true
  end
end
