# == Schema Information
#
# Table name: developer_goals
#
#  id         :integer          not null, primary key
#  notified   :boolean          default(FALSE)
#  amount     :integer          not null
#  person_id  :integer          not null
#  issue_id   :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_developer_goals_on_issue_id                (issue_id)
#  index_developer_goals_on_person_id               (person_id)
#  index_developer_goals_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

require 'spec_helper'

describe DeveloperGoal do
  let(:developer) { create(:person, first_name: "developer") }
  let(:issue) { create(:issue) }

  describe "#create" do
    let!(:bounty) { create(:bounty, amount: 1337, issue: issue) }
    let(:backer) { bounty.person }
    let(:developer_goal) { issue.developer_goals.create!(person: developer, amount: 4200) }

    it "should create a goal" do
      expect {
        issue.developer_goals.create(person: developer, amount: 4200)
        }.to change(DeveloperGoal, :count).by 1
    end
  end

  describe "#bounty_created_callbck" do
    context "when goal is reached" do
      let(:developer_goal) { create(:developer_goal, person: developer, issue: issue, amount: 4200) }
      let(:notified_developer_goal) { create(:developer_goal, person: developer, issue: issue, amount: 4200, notified: true) }
      let(:bounty) { build(:bounty, amount: 5000, issue: issue, person: person) }
      let(:person) { create(:person) }
      let(:cart) { person.shopping_cart }

      let(:checkout_method) {
        checkout_method = person.account || person.create_account
        person.reload
        Transaction::InternalTransfer::Promotional.gift_to_with_amount(person, 1000)
        checkout_method
      }
      
      let(:order) do
        bounty_attributes = ShoppingCart.item_to_attributes bounty
        cart.add_item(bounty_attributes)
        Transaction::Order.create_from_cart_and_checkout_method(cart, checkout_method)
      end

      it "should set goal as notified when developer is notified of goal being reached" do
        developer_goal
        saved_bounty =  order.items.first
        # Manually trigger the after_purchase callback
        saved_bounty.after_purchase(order)

        developer_goal.reload.should be_notified
      end

      context "goal is reached" do
        let!(:bounty) { create(:bounty, amount: 4500, issue: issue) }
        it "should reset notified when developer goal amount is updated" do
          notified_developer_goal.update_attributes(amount: 300)
          notified_developer_goal.reload.should_not be_notified
        end
      end
    end
  end

end
