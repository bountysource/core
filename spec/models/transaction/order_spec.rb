# == Schema Information
#
# Table name: transactions
#
#  id                 :integer          not null, primary key
#  description        :text
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  audited            :boolean
#  type               :string           default("Transaction"), not null
#  person_id          :integer
#  checkout_method_id :integer
#  gross              :decimal(, )
#  items              :decimal(, )
#  fee                :decimal(, )      default(0.0)
#  processing_fee     :decimal(, )      default(0.0)
#  merch_fee          :decimal(, )      default(0.0)
#  liability          :decimal(, )      default(0.0)
#
# Indexes
#
#  index_transactions_on_checkout_method_id  (checkout_method_id)
#  index_transactions_on_fees                (fee)
#  index_transactions_on_gross               (gross)
#  index_transactions_on_items               (items)
#  index_transactions_on_liability           (liability)
#  index_transactions_on_merch_fee           (merch_fee)
#  index_transactions_on_person_id           (person_id)
#  index_transactions_on_processing_fee      (processing_fee)
#

require 'spec_helper'

describe "Transaction::Order" do
  describe '::create_from_cart_and_checkout_method' do
    shared_examples_for 'a checkout method' do
      let(:item_amount) { 100 }

      let(:person) { create(:person) }
      let(:cart) { person.shopping_cart }

      let(:liability_account) { Account::Liability.instance }
      let(:payment_source) { order_class.payment_source(checkout_method) }

      let(:split_amount_for_item) { cart.split_amount_for_item(item_attributes, checkout_method) }
      let(:transaction) { order_class.create_from_cart_and_checkout_method(cart, checkout_method) }

      it 'should raise if cart empty' do
        expect { transaction }.to raise_error Transaction::Order::CartEmpty
      end

      shared_examples_for 'an item' do
        let(:item_attributes) { ShoppingCart.item_to_attributes(item) }
        before { cart.add_item(item_attributes) }

        it 'should create Transaction::Order' do
          expect { transaction }.to change(order_class, :count).by 1
        end

        it 'should create item' do
          expect { transaction }.to change(item_class, :count).by 1
        end

        it 'should change target account balance' do
          expect { transaction }.to change(target_account, :balance).by split_amount_for_item
        end

        it 'should change payment source account balance' do
          expect { transaction }.to change(payment_source, :balance).by (-1 * split_amount_for_item)
        end
      end

      describe 'pledge' do
        let(:item) { build(:pledge, amount: item_amount) }
        let(:item_class) { item.class }
        let(:target_account) { item.fundraiser.create_account }
        it_behaves_like 'an item'
      end

      describe 'bounty' do
        let(:item) { build(:bounty, amount: item_amount) }
        let(:item_class) { item.class }
        let(:target_account) { item.issue.create_account }
        it_behaves_like 'an item'
      end

      describe 'team payin' do
        let(:item) { build(:team_payin, amount: item_amount) }
        let(:item_class) { item.class }
        let(:target_account) { item.team.create_account }
        it_behaves_like 'an item'
      end
    end

    describe 'paypal' do
      let(:checkout_method) { Account::Paypal.instance }
      let(:order_class) { Transaction::Order::Paypal }
      it_behaves_like 'a checkout method'
    end

    describe 'coinbase' do
      let(:checkout_method) { Account::Coinbase.instance }
      let(:order_class) { Transaction::Order::Coinbase }
      it_behaves_like 'a checkout method'
    end

    describe 'personal account' do
      let(:person) { create(:person) }
      let(:checkout_method) { person.create_account }
      let(:order_class) { Transaction::Order::Internal }
      it_behaves_like 'a checkout method'
    end

    describe 'team account' do
      let(:person) { create(:person) }
      let(:team) { create(:team) }
      let(:checkout_method) { team.create_account }
      let(:order_class) { Transaction::Order::Internal }
      before { team.add_member(person) }
      it_behaves_like 'a checkout method'
    end

    describe 'edge cases' do
      describe 'bounty with tweet paid for with internal account' do
        shared_examples_for 'an internal checkout method' do
          let(:amount) { 100 }
          let(:tweet_amount) { 20 }
          let(:cart) { person.shopping_cart }

          let(:issue) { create(:issue) }
          let(:item) { build(:bounty, amount: amount, issue: issue, tweet: true) }
          let(:item_attributes) { ShoppingCart.item_to_attributes(item) }
          before { cart.add_item(item_attributes) }

          let(:issue_account) { issue.create_account }
          let(:liability_account) { Account::Liability.instance }
          let(:transaction) { Transaction::Order::Internal.create_from_cart_and_checkout_method(cart, internal_account) }
          let(:cart_gross) { cart.calculate_gross }

          it 'should remove gross from internal account' do
            expect { transaction }.to change(internal_account, :balance).by (-1 * cart_gross)
          end

          it 'should add item amount to issue account' do
            expect { transaction }.to change(issue_account, :balance).by amount
          end

          it 'should add tweet amount to liability account' do
            expect { transaction }.to change(liability_account, :balance).by tweet_amount
          end
        end

        describe 'personal account' do
          let(:person) { create(:person) }
          let(:internal_account) { person.create_account }
          it_behaves_like 'an internal checkout method'
        end

        describe 'team account' do
          let(:person) { create(:person) }
          let(:team) { create(:team) }
          let(:internal_account) { team.create_account }
          before { team.add_member(person) }
          it_behaves_like 'an internal checkout method'
        end
      end
    end
  end

  describe "Transaction::Order" do
    let(:person) { create(:person) }
    let(:cart) { person.shopping_cart }
    let!(:liability_account) { Account::Liability.instance }

    let(:liability) { -> (item) { cart.calculate_item_liability(item) } }
    let(:gross) { -> (item) { Transaction.gross_for_item(item) } }

    before do
      allow_any_instance_of(Proposal).to receive(:appoint!)
    end

    describe 'Paypal' do

      let(:paypal_account) { Account::Paypal.instance }
      let(:action) { -> { Transaction::Order::Paypal.create_from_cart_and_checkout_method person.shopping_cart, paypal_account } }

      describe 'Proposal' do
        let(:team) { create(:team) }
        let!(:team_member_relation) { create(:team_member_relation, person: person, team: team, developer: true, owner: person)}
        let(:tracker) { create(:tracker, team: team)}
        let(:issue) { create(:issue, tracker: tracker) }
        let(:rfp) { create(:request_for_proposal, issue: issue) }
        let(:rfp_account) { rfp.create_account }
        let!(:proposal) { create(:proposal, request_for_proposal: rfp) }
        let(:proposal_attributes) { ShoppingCart.item_to_attributes proposal }

        before do
          proposal_attributes = ShoppingCart.item_to_attributes proposal
          cart.add_item proposal_attributes
          cart.reload
        end

        it 'should not create a new Proposal' do
          expect(action).to_not change(issue.proposals, :count)
        end

        it 'should call Proposal#after_purchase' do
          expect_any_instance_of(Proposal).to receive(:after_purchase).once
          action.call
        end

        it 'should change Liability account' do
          expect(action).to change(liability_account, :balance).by -1 * liability[proposal_attributes]
        end

        it 'should change amount in Issue account' do
          expect(action).to change(rfp_account, :balance).by liability[proposal_attributes]
        end
      end
    end

    describe 'Coinbase' do

        let(:coinbase_account) { Account::Coinbase.instance }
        let(:action) { -> { Transaction::Order::Coinbase.create_from_cart_and_checkout_method person.shopping_cart, coinbase_account } }

        describe 'Proposal' do
          let(:team) { create(:team) }
          let!(:team_member_relation) { create(:team_member_relation, person: person, team: team, developer: true, owner: person)}
          let(:tracker) { create(:tracker, team: team)}
          let(:issue) { create(:issue, tracker: tracker) }
          let(:rfp) { create(:request_for_proposal, issue: issue) }
          let(:rfp_account) { rfp.create_account }
          let!(:proposal) { create(:proposal, request_for_proposal: rfp) }
          let(:proposal_attributes) { ShoppingCart.item_to_attributes proposal }

          before do
            proposal_attributes = ShoppingCart.item_to_attributes proposal
            cart.add_item proposal_attributes
            cart.reload
          end

          it 'should not create a new Proposal' do
            expect(action).to_not change(issue.proposals, :count)
          end

          it 'should call Proposal#after_purchase' do
            expect_any_instance_of(Proposal).to receive(:after_purchase).once
            action.call
          end

          it 'should change Liability account' do
            expect(action).to change(liability_account, :balance).by -1 * liability[proposal_attributes]
          end

          it 'should change amount in Issue account' do
            expect(action).to change(rfp_account, :balance).by liability[proposal_attributes]
          end
        end
    end

    describe 'Personal Account' do

       let(:personal_account) { person.create_account }
       let(:action) { -> { Transaction::Order::Internal.create_from_cart_and_checkout_method person.shopping_cart, personal_account } }

       describe 'Proposal' do
         let(:team) { create(:team) }
         let!(:team_member_relation) { create(:team_member_relation, person: person, team: team, developer: true, owner: person)}
         let(:tracker) { create(:tracker, team: team)}
         let(:issue) { create(:issue, tracker: tracker) }
         let(:rfp) { create(:request_for_proposal, issue: issue) }
         let(:rfp_account) { rfp.create_account }
         let!(:proposal) { create(:proposal, request_for_proposal: rfp) }

         before do
           proposal_attributes = ShoppingCart.item_to_attributes proposal
           cart.add_item proposal_attributes
           cart.reload
         end

         it 'should not create a new Proposal' do
           expect(action).to_not change(issue.proposals, :count)
         end

         it 'should change Personal account' do
           expect(action).to change(personal_account, :balance).by -1 * gross[proposal]
         end

         it 'should call Proposal#after_purchase' do
           expect_any_instance_of(Proposal).to receive(:after_purchase).once
           action.call
         end

         it 'should change amount in Issue account' do
           expect(action).to change(rfp_account, :balance).by gross[proposal]
         end

         it 'should not change Liability account' do
           expect(action).not_to change(liability_account, :balance)
         end
       end
    end

    describe 'Team Account' do

      let(:team) { create(:team) }
      let(:team_account) { team.create_account }
      let(:action) { -> { Transaction::Order::Internal.create_from_cart_and_checkout_method person.shopping_cart, team_account } }

      before { team.add_member(person, admin: true) }

      describe 'Proposal' do
        let(:tracker) { create(:tracker, team: team)}
        let(:issue) { create(:issue, tracker: tracker) }
        let(:rfp) { create(:request_for_proposal, issue: issue) }
        let(:rfp_account) { rfp.create_account }
        let!(:proposal) { create(:proposal, request_for_proposal: rfp) }

        before do
          proposal_attributes = ShoppingCart.item_to_attributes proposal
          cart.add_item proposal_attributes
          cart.reload
        end

        it 'should not create a new Proposal' do
          expect(action).to_not change(issue.proposals, :count)
        end

        it 'should call Proposal#after_purchase' do
          expect_any_instance_of(Proposal).to receive(:after_purchase).once
          action.call
         end

        it 'should change Team account' do
          expect(action).to change(team_account, :balance).by -1 * gross[proposal]
        end

        it 'should change amount in Issue account' do
          expect(action).to change(rfp_account, :balance).by gross[proposal]
        end

        it 'should not change Liability account' do
          expect(action).not_to change(liability_account, :balance)
        end
       end
    end
  end

end
