class AddCategoryToIssue < ActiveRecord::Migration[5.1]
  def up
    add_column :issues, :category, :integer
    ActiveRecord::Base.connection.execute("UPDATE issues SET category = 1 WHERE id IN (SELECT DISTINCT issue_id FROM bounties)")
  end

  def down
    remove_column :issues, :category
  end
end
