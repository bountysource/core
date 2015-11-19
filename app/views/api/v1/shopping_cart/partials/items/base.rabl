attribute :amount

node(:type) { root_object.class.name }
node(:index) { root_object.shopping_cart_data.index }
node(:added_at) { root_object.shopping_cart_data.added_at }
node(:updated_at) { root_object.shopping_cart_data.updated_at }