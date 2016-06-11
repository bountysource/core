class CreateTeamClaims < ActiveRecord::Migration
  def change
    create_table :team_claims do |t|
      t.integer :person_id, null: false
      t.integer :team_id, null: false
      t.text :claim_notes
      t.text :rejected_notes
      t.datetime :accepted_at
      t.datetime :rejected_at
      t.timestamps
    end
  end
end
