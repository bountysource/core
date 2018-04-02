require 'spec_helper'

describe Api::V0::TransactionsController do
  render_views

  let(:admin)     { create(:person, admin: true) }
  let(:non_admin) { create(:person) }
  let(:item)      { create(:person) }

  let!(:transaction) do
    Transaction.build do |tr|
      tr.description  = "Test transaction, please ignore"

      tr.splits.create([
        { amount: -100, item: create(:person_with_money_in_account, money_amount: 100) },
        { amount: 100,  item: create(:issue) }
      ])
    end
  end

  let(:response_data) { JSON.parse response.body }

  context "as admin" do
    let(:params) do
      { access_token: admin.create_access_token+".#{Api::Application.config.admin_secret}" }
    end

    describe "index" do
      it "should show all transactions" do
        get 'index', params: params
        assert_response :ok
      end
    end

    describe "show" do
      it "should show transaction" do
        get 'show', params: params.merge(id: transaction.id)
        assert_response :ok
        expect(response_data['id']).to eq(transaction.id)
      end
    end

    describe "create" do
      let!(:person)  { create(:person_with_money_in_account, money_amount: 10) }
      let!(:issue)   { create(:issue) }
      let!(:item)    { create_bounty 10, person: person, issue: issue }
      let(:params) do
        { access_token: admin.create_access_token+".#{Api::Application.config.admin_secret}" }
      end

      it "should require splits" do
        post 'create', params: params
        assert_response :unprocessable_entity
      end

      it "should create transaction" do
        splits_data = [
          { amount: 10,   item_id: person.id, item_type: person.class.name },
          { amount: -10,  account_id: Account::BountySourceAdjustment.instance.id, account_type: Account::BountySourceAdjustment.name }
        ]

        expect {
          post 'create', params: params.merge(
            description:  "Test transaction, please ignore",
            splits:       splits_data.map.with_index { |x, i| [i, x] }.to_h
          )
          assert_response :ok
        }.to change{person.txns.count}.by(1)
         .and change{Split.count}.by(splits_data.count)
      end

      it "should require at least 2 splits" do
        splits_data = [
          { amount: 10,   item_id: person.id, item_type: person.class.name },
        ]

        expect {
          post 'create', params: params.merge(
            description:  "Test transaction, please ignore",
            splits:       splits_data.map.with_index { |x, i| [i, x] }.to_h
          )
          assert_response :unprocessable_entity
        }.to change{person.txns.count}.by(0)
         .and change{issue.txns.count}.by(0)
         .and change{item.txns.count}.by(0)
         .and change{Split.count}.by(0)
      end

      it "should require balanced splits" do
        splits_data = [
          { amount: 10, item_id: person.id, item_type: person.class.name },
          { amount: -9, account_id: Account::BountySourceAdjustment.instance.id, account_type: Account::BountySourceAdjustment.name }
        ]

        expect {
          post 'create', params: params.merge(
            description:  "Test transaction, please ignore",
            splits:       splits_data.map.with_index { |x, i| [i, x] }.to_h
          )
          assert_response :unprocessable_entity
        }.to change{person.txns.count}.by(0)
         .and change{Split.count}.by(0)
      end

      it "should create transaction with hella splits" do
        santa_claus = create(:person_with_money_in_account, money_amount: 20000)
        children    = create_list(:person, 20)

        splits_data = [{ amount: -20000, item_id: santa_claus.id, item_type: santa_claus.class.name }]
        splits_data += children.map { |child| { amount: 1000, item_id: child.id, item_type: child.class.name } }

        expect {
          post 'create', params: params.merge(
            item_id:      item.id,
            item_type:    item.class.name,
            description:  "Test transaction, please ignore",
            splits:       splits_data.map.with_index { |x, i| [i, x] }.to_h
          )
          assert_response :ok
        }.to change{santa_claus.txns.count}.by(1)
         .and change{Split.count}.by(splits_data.count)
         .and change{Split.where(account_id: Account.where(owner_type: 'Person', owner_id: children.map(&:id))).count }.by(children.count)
         #
      end
    end

    describe "update" do
      let(:person)  { create(:person_with_money_in_account, money_amount: 10) }
      let(:issue)   { create(:issue) }

      it "should add new splits if they are balanced" do
        splits_data = [
          { amount: -10, item_id: person.id, item_type: person.class.name },
          { amount: 5, item_id: issue.id, item_type: issue.class.name },
          { amount: 5, item_id: issue.id, item_type: issue.class.name },
        ]

        expect {
          put :update, params: params.merge(
            description: transaction.description,
            splits: splits_data.map.with_index { |x, i| [i, x] }.to_h,
            id: transaction.id
          )
          assert_response :ok
          transaction.reload
        }.to change(transaction.splits, :count).by 1
      end

      it "should not add new splits if they are unbalanced" do
        splits_data = [
          { amount: -9, item_id: person.id, item_type: person.class.name },
          { amount: 10, item_id: issue.id, item_type: issue.class.name },
        ]

        expect {
          put :update, params: params.merge(
            splits: splits_data.map.with_index { |x, i| [i, x] }.to_h,
            id: transaction.id
          )
          assert_response :unprocessable_entity
          transaction.reload
        }.not_to change(transaction.splits, :count)
      end

      it "should update transaction description" do
        description = "I've got a lovely bunch of coconuts, there they are standing in a row!"

        expect {
          put 'update', params: params.merge(description: description, id: transaction.id)
          assert_response :ok
          transaction.reload
        }.to change(transaction, :description).to description
      end

      # TODO: item is on splits now, not transactions
      #it "should update transaction item" do
      #  new_item = create_bounty 10
      #
      #  lambda {
      #    put 'update', params: params.merge(description: transaction.description, item_id: new_item.id, item_type: new_item.class.name)
      #    transaction.reload
      #  }.should change(transaction, :item).to new_item
      #end
    end

    describe "destroy" do
      it "should destroy splits" do
        expect {
          delete 'destroy', params: params.merge(id: transaction.id)
          assert_response :no_content
        }.to change(Split, :count).by -transaction.splits.count
      end

      it "should destroy transaction" do
        expect {
          delete 'destroy', params: params.merge(id: transaction.id)
          assert_response :no_content
        }.to change(Transaction, :count).by -1
      end
    end
  end

  context "as non admin" do
    let(:params) do
      { access_token: non_admin.create_access_token, id: transaction.id }
    end

    it "should require admin for index" do
      get 'index', params: params
      assert_response :unauthorized
    end

    it "should require admin for show" do
      get 'show', params: params
      assert_response :unauthorized
    end

    it "should require admin for update" do
      put 'update', params: params
      assert_response :unauthorized
    end

    it "should require admin for destroy" do
      delete 'destroy', params: params
      assert_response :unauthorized
    end
  end

end
