class AddBatchIdToCashOuts < ActiveRecord::Migration
  def change
    add_column :cash_outs, :batch_id, :string
  end
end
