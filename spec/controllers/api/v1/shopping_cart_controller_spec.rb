# require 'spec_helper'
#
# describe Api::V1::ShoppingCartController do
#   render_views
#
#   let(:person) { create(:person) }
#   let(:cart) { person.shopping_cart }
#   let(:issue) { create(:issue) }
#   let(:params) do
#     {
#       access_token: person.create_access_token,
#       currency: 'USD'
#     }
#   end
#
#   it "should not constantize arbitrary input" do
#     post :add_item, params.merge(item_type: "UnsafeClass")
#     assert_response :bad_request
#   end
#
#   it "should add item" do
#     cart.items.count.should be == 0
#
#     post :add_item, params.merge(
#       item_type: "Bounty",
#       anonymous: true,
#       amount: 100,
#       issue_id: issue.id
#     )
#
#     assert_response :accepted
#
#     cart.reload
#
#     cart.items.count.should be == 1
#     cart.get_item(0).should be_a Bounty
#     cart.get_item(0).amount.should be == 100
#     cart.get_item(0).issue.should be == issue
#   end
#
#   context "with item" do
#     let(:bounty) { build(:bounty, amount: 1337, person: person, issue: issue) }
#
#     before do
#       cart.add_item(bounty)
#     end
#
#     it "should remove item" do
#       cart.items.count.should be == 1
#       delete :remove_item, params.merge(index: 0)
#       cart.reload
#       cart.items.count.should be == 0
#     end
#
#     it "should update item" do
#       cart.get_item(0).amount.should be == 1337
#       put :update_item, params.merge(index: 0, amount: 42)
#       cart.reload
#       cart.get_item(0).amount.should be == 42
#     end
#   end
#
#   describe "import items" do
#     let(:bounty) { build(:bounty, amount: 100, person: person) }
#     let(:pledge) { build(:pledge, amount: 100, person: person) }
#
#     it "should import items" do
#       person.shopping_cart.items.should be_empty
#
#       request.env['HTTP_CONTENT_TYPE'] = 'application/json'
#
#       payload = {
#         items: [
#           ShoppingCart.send(:serialize_item, bounty),
#           ShoppingCart.send(:serialize_item, pledge)
#         ]
#       }
#
#       post :import, params.merge(payload)
#       assert_response :ok
#       person.reload.shopping_cart.items.count.should be == payload[:items].count
#     end
#   end
# end
#
