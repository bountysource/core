class AddErc20ToCurrency < ActiveRecord::Migration[5.1]
  def change
    add_column :currencies, :name, :string
    add_column :currencies, :symbol, :string
    add_column :currencies, :address, :string
    add_column :currencies, :cloudinary_id, :string
    add_column :currencies, :featured, :boolean

    change_column_null :currencies, :value, true

    add_index :currencies, :symbol
  end
end
