class CreateQuickbooksTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :quickbooks_tokens do |t|
      t.string :access_token
      t.string :refresh_token
      t.datetime :expires_at

      t.timestamps
    end
  end
end
