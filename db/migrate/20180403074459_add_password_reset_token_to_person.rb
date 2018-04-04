class AddPasswordResetTokenToPerson < ActiveRecord::Migration[5.1]
  def change
  	add_column :people, :reset_digest, :string
  	add_column :people, :reset_sent_at, :datetime
  end
end
