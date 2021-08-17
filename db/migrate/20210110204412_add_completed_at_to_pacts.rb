class AddCompletedAtToPacts < ActiveRecord::Migration[5.1]
  def change
    add_column :pacts, :completed_at, :datetime
  end
end
