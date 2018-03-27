# == Schema Information
#
# Table name: shopping_carts
#
#  id                :integer          not null, primary key
#  person_id         :integer
#  items             :text             default("[]"), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  order_id          :integer
#  uid               :string(255)
#  payment_method_id :integer
#  status            :text             default("draft"), not null
#
# Indexes
#
#  index_shopping_carts_on_order_id  (order_id)
#  index_shopping_carts_on_status    (status)
#  index_shopping_carts_on_uid       (uid)
#

FactoryBot.define do

  factory :shopping_cart, class: ShoppingCart do
    #association :payment_method, factory: :payment_method
  end

end
