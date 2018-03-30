class DropGittipIpns < ActiveRecord::Migration[5.0]
  def change
    drop_table :gittip_ipns
  end
end
