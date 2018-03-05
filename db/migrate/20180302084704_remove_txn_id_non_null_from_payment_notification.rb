class RemoveTxnIdNonNullFromPaymentNotification < ActiveRecord::Migration
  def change
  	change_column_null :payment_notifications, :txn_id, true
  end
end
