class DropGittipIpns < ActiveRecord::Migration
  def change
    drop_table :gittip_ipns
  end
end
