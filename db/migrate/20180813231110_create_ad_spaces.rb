class CreateAdSpaces < ActiveRecord::Migration[5.1]
  def change
    create_table :ad_spaces do |t|
      t.string :cloudinary_id
      t.string :title
      t.text :text
      t.string :button_text
      t.string :button_url
      t.string :position

      t.timestamps
    end
  end
end
