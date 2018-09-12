# == Schema Information
#
# Table name: shopping_carts
#
#  id                :integer          not null, primary key
#  person_id         :integer
#  items             :text             default([]), not null
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

require 'spec_helper'

describe ShoppingCart do

  let(:person) { create(:person) }

  describe 'add item' do
    let(:person) { create(:person) }
    let(:cart) { person.shopping_cart }

    let(:add_item) { cart.add_item(item_attributes) }

    shared_examples_for 'an item' do
      it 'should add item' do
        expect { add_item }.to(change(cart.items, :count).by(1))
      end

      it 'should add item with empty amount' do
        item_attributes['amount'] = ''
        expect { add_item }.to(change(cart.items, :count).by(1))
      end

      it 'should add item with nil amount' do
        item_attributes['amount'] = nil
        expect { add_item }.to(change(cart.items, :count).by(1))
      end

      it 'should add item with no amount attribute' do
        item_attributes.delete('amount')
        expect { add_item }.to(change(cart.items, :count).by(1))
      end
    end

    describe 'proposals' do
      let(:team) { create(:team) }
      let!(:team_member_relation) { create(:team_member_relation, person: person, team: team, developer: true, owner: person)}
      let(:tracker) { create(:tracker, team: team)}
      let(:issue) { create(:issue, tracker: tracker) }
      let(:rfp) { create(:request_for_proposal, issue: issue) }
      let!(:proposal) { create(:proposal, request_for_proposal: rfp) }
      let(:item_attributes) do
        {
          proposal_id: proposal.id,
          item_type: 'proposal',
          amount: 1000,
          currency: 'USD',
          request_for_proposal_id: rfp.id
        }
      end

      it_behaves_like 'an item'
    end

    describe 'bounties' do
      let(:issue) { create(:issue) }
      let(:item_attributes) do
        {
          item_type: 'bounty',
          amount: 1000,
          currency: 'USD',
          issue_id: issue.id
        }
      end
      it_behaves_like 'an item'
    end

    describe 'pledges' do
      let(:fundraiser) { create(:fundraiser) }
      let(:item_attributes) do
        {
          item_type: 'pledge',
          fundraiser_id: fundraiser.id,
          amount: 100,
          currency: 'USD'
        }
      end
      it_behaves_like 'an item'
    end

    describe 'team_payins' do
      let(:team) { create(:team) }
      let(:item_attributes) do
        {
          item_type: 'team_payin',
          amount: 1000,
          currency: 'USD',
          team_id: team.id
        }
      end
      it_behaves_like 'an item'
    end

  end

  describe 'update item' do

    let(:person) { create(:person) }
    let(:cart) { person.shopping_cart }

    before do
      cart.add_item item_attributes
    end

    let(:update_item) { -> (index, attrs) { cart.update_item index, attrs } }

    describe 'proposals' do
      let(:team) { create(:team) }
      let!(:team_member_relation) { create(:team_member_relation, person: person, team: team, developer: true, owner: person)}
      let!(:proposal) { create(:proposal, request_for_proposal: rfp) }
      let(:tracker) { create(:tracker, team: team)}
      let(:issue) { create(:issue, tracker: tracker) }
      let(:rfp) { create(:request_for_proposal, issue: issue) }
      let(:item_attributes) do
        {
          proposal_id: proposal.id,
          item_type: 'proposal',
          amount: 1000,
          currency: 'USD',
          request_for_proposal_id: rfp.id
        }
      end

      it "should raise an AuthorizationError when updating a Proposal in a cart that isn't owned by the person" do
        index = 0
        attrs = { 'amount' => '300.0'}
        cart.add_item item_attributes
        update_item[index, attrs]
        updated_item = cart.reload.items[index]
        expect(updated_item['amount']).to eq('300.0')
      end
    end

    describe 'pledges' do

      let(:fundraiser) { create(:fundraiser) }
      let(:reward) { create(:reward, fundraiser: fundraiser) }
      let(:item_attributes) do
        {
          item_type: 'pledge',
          fundraiser_id: fundraiser.id,
          amount: 100,
          currency: 'USD'
        }
      end

      it 'should change amount' do
        index = 0
        attrs = { 'amount' => '1500.0' }

        update_item[index, attrs]
        serialized_item = cart.reload.items[index]
        expect(serialized_item['amount']).to eq(attrs['amount'])
      end

      it 'should change anonymous' do
        index = 0
        attrs = { 'anonymous' => true }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['anonymous']).to eq(attrs['anonymous'])
      end

      it 'should change owner_id' do
        index = 0
        attrs = { 'owner_id' => person.id + 1 }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['owner_id']).to eq(attrs['owner_id'])
      end

      it 'should change owner_type' do
        index = 0
        attrs = { 'owner_type' => 'Team' }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['owner_type']).to eq(attrs['owner_type'])
      end

      it 'should change reward_id' do
        index = 0
        attrs = { 'reward_id' => reward.id + 1 }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['reward_id']).to eq(attrs['reward_id'])
      end

      it 'should change survey_response' do
        index = 0
        attrs = { 'survey_response' => "You've got to hold on to what you've got, it doesn't make a different if we make it or not. We've got each other, and that's a lot, for love, WE'LL GIVE IT A SHOT" }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['survey_response']).to eq(attrs['survey_response'])
      end

    end

    describe 'bounties' do

      let(:issue) { create(:issue) }
      let(:item_attributes) do
        {
          item_type: 'bounty',
          amount: 1000,
          currency: 'USD',
          issue_id: issue.id
        }
      end

      it 'should change amount' do
        index = 0
        attrs = { 'amount' => '1500.0' }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['amount']).to eq(attrs['amount'])
      end

      it 'should change anonymous' do
        index = 0
        attrs = { 'anonymous' => true }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['anonymous']).to eq(attrs['anonymous'])
      end

      it 'should change owner_id' do
        index = 0
        attrs = { 'owner_id' => person.id + 1 }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['owner_id']).to eq(attrs['owner_id'])
      end

      it 'should change owner_type' do
        index = 0
        attrs = { 'owner_type' => 'Team' }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['owner_type']).to eq(attrs['owner_type'])
      end

    end

    describe 'team_payins' do

      let(:team) { create(:team) }
      let(:item_attributes) do
        {
          item_type: 'team_payin',
          amount: 1000,
          currency: 'USD',
          team_id: team.id
        }
      end

      it 'should change amount' do
        index = 0
        attrs = { 'amount' => '1500.0' }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['amount']).to eq(attrs['amount'])
      end

      it 'should change amount' do
        index = 0
        attrs = { 'amount' => '1500.0' }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['amount']).to eq(attrs['amount'])
      end

      it 'should change owner_id' do
        index = 0
        attrs = { 'owner_id' => person.id + 1 }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['owner_id']).to eq(attrs['owner_id'])
      end

      it 'should change owner_type' do
        index = 0
        attrs = { 'owner_type' => 'Team' }

        update_item[index, attrs]

        serialized_item = cart.reload.items[index]
        expect(serialized_item['owner_type']).to eq(attrs['owner_type'])
      end

    end

  end

  describe 'remove item' do

    let(:person) { create(:person) }
    let(:cart) { person.shopping_cart }
    let(:issue) { create(:issue) }
    let(:item_attributes) do
      {
        item_type: 'bounty',
        amount: 1000,
        currency: 'USD',
        issue_id: issue.id
      }
    end

    before { cart.add_item item_attributes }

    let(:remove_item) { -> (index) { cart.remove_item index } }

    it 'should remove item' do
      expect(cart.items.count).to eq(1)
      remove_item[0]
      expect(cart.reload).to be_empty
    end

    describe 'proposals' do
      let(:proposal) { build(:proposal) }
      let(:cart) { build(:shopping_cart) }
      let(:item_index) { 0 }

      before do
        allow(cart).to receive(:load_item_at).and_return(proposal)
      end

      it 'should change state from pending_acceptance to pending' do
        expect(proposal).to receive(:reverse_appointment!).once
        cart.remove_item(item_index)
      end
    end

  end

  describe 'replace shopping cart' do

    let(:person) { create(:person) }
    let!(:cart) { person.shopping_cart }

    let(:action) { -> { cart.replace! } }

    it 'should create new shopping cart' do
      expect(action).to change(person.shopping_carts, :count).by 1
    end

    it 'should save old shopping cart' do
      old_cart = person.shopping_cart
      action[]
      expect(person.reload.shopping_carts).to include old_cart
    end

    it 'should have new cart on person' do
      new_cart = action[]
      expect(person.reload.shopping_cart).to eq(new_cart)
    end

  end

  describe 'unauthorized cart' do

    let(:person) { create(:person) }
    let(:cart) { ShoppingCart.new }


    it 'should be valid without person' do
      expect(ShoppingCart.new).to be_valid
    end
  end

  describe 'merge' do

    let!(:new) { create(:shopping_cart) }
    let!(:old) { create(:shopping_cart) }

    let(:person) { create(:person) }
    let(:fundraiser) { create(:fundraiser) }
    let(:pledge_attributes) do
      {
        item_type: 'pledge',
        fundraiser_id: fundraiser.id,
        amount: 100,
        currency: 'USD'
      }
    end

    before do
      new.add_item pledge_attributes
      old.add_item pledge_attributes
    end

    let(:action) { -> { new.merge! old } }

    it 'should move items to new' do
      action[]
      expect(new.items.count).to eq(2)
    end

    it 'should delete old' do
      action[]
      expect { old.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'should not delete new' do
      action[]
      expect { new.reload }.not_to raise_error
    end

  end

  describe 'item to attributes' do

    let(:item_to_attributes) { -> (item) { ShoppingCart.item_to_attributes(item).with_indifferent_access } }

    describe 'Pledge' do

      let(:person) { create(:person) }
      let(:fundraiser) { create(:fundraiser) }
      let(:reward) { fundraiser.rewards.create(amount: 100, description: 'Fundraiser', fulfillment_details: 'I need an address') }
      let(:pledge) do
        build(:pledge,
          owner: person,
          amount: 100,
          fundraiser: fundraiser,
          reward: reward,
          survey_response: 'Here is my address'
        )
      end

      it 'should have attributes' do
        attrs = item_to_attributes[pledge]
        expect(attrs[:item_type]).to eq('pledge')
        expect(attrs[:owner_id]).to eq(pledge.owner_id)
        expect(attrs[:owner_type]).to eq(pledge.owner_type)
        expect(attrs[:amount]).to eq(pledge.amount)
        expect(attrs[:currency]).to eq('USD')

        expect(attrs[:fundraiser_id].to_i).to eq(pledge.fundraiser_id)
        expect(attrs[:reward_id].to_i).to eq(pledge.reward_id)
        expect(attrs[:survey_response]).to eq(pledge.survey_response)
      end

    end

    describe 'Bounty' do

      let(:person) { create(:person) }
      let(:issue) { create(:issue) }
      let(:bounty) do
        build(:bounty,
          owner: person,
          amount: 100,
          issue: issue,
          bounty_expiration: 'foo',
          upon_expiration: 'bar',
          tweet: true
        )
      end

      it 'should have attributes' do
        attrs = item_to_attributes[bounty]
        expect(attrs[:item_type]).to eq('bounty')
        expect(attrs[:owner_id]).to eq(bounty.owner_id)
        expect(attrs[:owner_type]).to eq(bounty.owner_type)
        expect(attrs[:amount]).to eq(bounty.amount)
        expect(attrs[:currency]).to eq('USD')

        expect(attrs[:issue_id].to_i).to eq(bounty.issue_id)
        expect(attrs[:bounty_expiration]).to eq(bounty.bounty_expiration)
        expect(attrs[:upon_expiration]).to eq(bounty.upon_expiration)
        expect(attrs[:tweet]).to eq(bounty.tweet)
      end

    end

    describe 'TeamPayin' do

      let(:person) { create(:person) }
      let(:team) { create(:team) }
      let(:team_payin) do
        build(:team_payin,
          owner: person,
          team: team,
          amount: 100
        )
      end

      it 'should have attributes' do
        attrs = item_to_attributes[team_payin]
        expect(attrs[:item_type]).to eq('team_payin')
        expect(attrs[:owner_id]).to eq(team_payin.owner_id)
        expect(attrs[:owner_type]).to eq(team_payin.owner_type)
        expect(attrs[:amount]).to eq(team_payin.amount)
        expect(attrs[:currency]).to eq('USD')

        expect(attrs[:team_id]).to eq(team_payin.team_id)
      end

    end

  end

  describe 'find or create' do

    describe 'anonymous cart created and person has no cart' do

      let(:person) { create(:person) }
      let!(:anonymous_cart) { create(:shopping_cart, person_id: nil) }

      it 'should return anonymous cart' do
        cart = ShoppingCart.find_or_create uid: anonymous_cart.uid, person: nil
        expect(cart).to eq(anonymous_cart)
      end

      it 'should associate anonymous cart with person if person present' do
        expect(person.shopping_cart_id).to be_nil
        cart = ShoppingCart.find_or_create uid: anonymous_cart.uid, person: person
        expect(cart).to eq(anonymous_cart)
      end

    end

    describe 'person has cart and no anonymous cart was created' do

      let(:person) { create(:person) }
      let!(:person_cart) { person.shopping_cart }

      it 'should return person cart' do
        cart = ShoppingCart.find_or_create uid: nil, person: person
        expect(cart).to eq(person_cart)
      end

    end

    # This is meant to verify the scenario where a person has already checked-out a cart. We want to be sure that
    # the processed cart isn't returned to the user. To verify we aren't returning processed carts, we will
    # check to see if the cart has an order_id.
    describe "anonymous cart exists but has already been checked out (i.e. has order_id) and person has a cart" do
      let(:person) { create(:person) }
      let!(:person_cart) { person.shopping_cart }
      let!(:anonymous_cart) { create(:shopping_cart, order_id: 1) }

      it 'should return the person_cart' do
        cart = ShoppingCart.find_or_create uid: anonymous_cart.uid, person: person
        expect(cart).to eq(person_cart)
      end
    end

    describe 'anonymous cart created and person has cart' do

      let(:person) { create(:person) }
      let!(:person_cart) { person.shopping_cart }
      let!(:anonymous_cart) { create(:shopping_cart) }

      it 'should return person cart' do
        cart = ShoppingCart.find_or_create uid: anonymous_cart.uid, person: person
        expect(cart).to eq(person_cart)
      end
    end

    describe 'person does not have cart and no anonymous cart created' do

      let(:person) { create(:person) }

      it 'should create cart' do
        expect {
          cart = ShoppingCart.find_or_create uid: nil, person: nil
        }.to change(ShoppingCart, :count).by 1
      end

      it 'should create cart on person if not yet created' do
        cart = ShoppingCart.find_or_create uid: nil, person: person
        expect(cart).to eq(person.shopping_cart)
      end

      it 'should raise RecordNotFound if autocreate is false' do
        expect {
          ShoppingCart.find_or_create uid: nil, person: person, autocreate: false
        }.to raise_error ActiveRecord::RecordNotFound
      end

    end

  end

  describe '#calculate_gross' do
    let(:person) { create(:person) }
    let(:cart) { person.shopping_cart }

    describe 'bounty with tweet' do
      # TODO a revisit to the upsell system
      let(:tweet_amount) { 20 }
      let(:issue) { create(:issue) }
      let(:item_attributes) do
        {
          item_type: 'Bounty',
          amount: 100,
          currency: 'USD',
          issue_id: issue.id,
          tweet: true
        }
      end

      it 'should calculate gross' do
        cart.add_item(item_attributes)
        expect(cart.calculate_gross).to eq(item_attributes[:amount] + tweet_amount)
      end
    end

    describe 'bounty without tweet' do
      let(:issue) { create(:issue) }
      let(:item_attributes) do
        {
          item_type: 'Bounty',
          amount: 100,
          currency: 'USD',
          issue_id: issue.id,
          tweet: false
        }
      end

      it 'should calculate gross' do
        cart.add_item(item_attributes)
        expect(cart.calculate_gross).to eq(item_attributes[:amount])
      end
    end

    describe 'pledge' do
      let(:fundraiser) { create(:fundraiser) }
      let(:item_attributes) do
        {
          item_type: 'Pledge',
          amount: 100,
          currency: 'USD',
          fundraiser_id: fundraiser.id
        }
      end

      it 'should calculate gross' do
        cart.add_item(item_attributes)
        expect(cart.calculate_gross).to eq(item_attributes[:amount])
      end
    end

    describe 'team payin' do
      let(:team) { create(:team) }
      let(:item_attributes) do
        {
          item_type: 'TeamPayin',
          amount: 100,
          currency: 'USD',
          team_id: team.id
        }
      end

      it 'should calculate gross' do
        cart.add_item(item_attributes)
        expect(cart.calculate_gross).to eq(item_attributes[:amount])
      end
    end
  end

end
