class RemoveUniqueIndexForCryptoPayOut < ActiveRecord::Migration[5.1]
  def change
    remove_index :crypto_pay_outs, :issue_id
    add_index :crypto_pay_outs, :issue_id
  end
end
