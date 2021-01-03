class CreatePacts < ActiveRecord::Migration[5.1]
  def change
    create_table :pacts do |t|
      t.string :project_name
      t.string :type
      t.string :experience_level
      t.string :time_commitment
      t.string :issue_type
      t.datetime :expires_at
      t.datetime :paid_at
      t.string :link
      t.string :issue_url
      t.string :project_description
      t.decimal :amount, precision: 10, scale: 2, null: false        
      t.integer :person_id
      t.string :owner_type
      t.integer :owner_id
      t.boolean :featured, default: false, null: false                                     

      t.timestamps
    end
  end
end
