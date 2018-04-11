class AddEmailVerificationToUser < ActiveRecord::Migration[5.1]
  def up
    add_column :people, :confirmation_token, :string
    add_column :people, :confirmed_at, :datetime
    add_column :people, :confirmation_sent_at, :datetime
    add_column :people, :unconfirmed_email, :string
    ActiveRecord::Base.connection.execute("UPDATE people SET confirmed_at = CURRENT_TIMESTAMP WHERE NOT deleted = true AND suspended_at IS NULL;")
  end

  def down
    remove_columns :people, :confirmation_token, :confirmed_at, :confirmation_sent_at
    remove_columns :people, :unconfirmed_email
  end
end
