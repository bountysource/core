class AddApprovedAtToCashOuts < ActiveRecord::Migration
  def change
    add_column :cash_outs, :approved_at, :datetime
  end
end
