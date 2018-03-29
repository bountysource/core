class RemoveLinkedAccountUidNotNull < ActiveRecord::Migration
  def change
    change_column_null :linked_accounts, :uid, true
  end
end
