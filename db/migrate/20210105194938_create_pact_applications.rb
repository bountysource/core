class CreatePactApplications < ActiveRecord::Migration[5.1]
  def change
    create_table :pact_applications do |t|
      t.references :person, foreign_key: true
      t.references :pact, foreign_key: true
      t.string :note
      t.datetime :completion_date
      t.string :status

      t.timestamps
    end
  end
end
