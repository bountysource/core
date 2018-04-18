class RemoveTxnIdNonNullFromPaymentNotification < ActiveRecord::Migration[5.0]
  def change
  	change_column_null :payment_notifications, :txn_id, true
  end
end
