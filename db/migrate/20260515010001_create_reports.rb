class CreateReports < ActiveRecord::Migration[5.1]
  def change
    create_table :reports do |t|
      t.integer :reporter_id, null: false
      t.string :target_type, null: false
      t.integer :target_id, null: false
      t.string :reason, null: false, default: 'spam'
      t.text :description
      t.string :status, null: false, default: 'open'

      t.timestamps
    end

    add_index :reports, [:target_type, :target_id]
    add_index :reports, :reporter_id
    add_index :reports, :status
    add_index :reports, [:reporter_id, :target_type, :target_id], name: 'index_reports_on_reporter_and_target', unique: true
  end
end
