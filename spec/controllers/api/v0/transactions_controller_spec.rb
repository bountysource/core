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
      { access_token: admin.create_access_token+".#{Api::Application.config.admin_secret}", id: transaction.id }
    end

    it "should show all transactions" do
      get 'index', params: params
      assert_response :ok
    end

    it "should show transaction" do
      get 'show', params: params
      assert_response :ok
      response_data['id'].should == transaction.id
    end

    describe "creation" do
      let(:person)  { create(:person_with_money_in_account, money_amount: 10) }
      let(:issue)   { create(:issue) }
      let(:item)    { create_bounty 10, person: person, issue: issue }
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

        lambda {
          post 'create', params: params.merge(
            item_id:      item.id,
            item_type:    item.class.name,
            description:  "Test transaction, please ignore",
            splits:       splits_data.to_json
          )
          assert_response :created
        }.should do
          change(person.txns, :count).by 1
          change(issue.txns, :count).by 1
          change(item.txns, :count).by 1
          change(Split, :count).by splits_data.count
        end
      end

      it "should require at least 2 splits" do
        splits_data = [
          { amount: 10,   item_id: person.id, item_type: person.class.name },
        ]

        lambda {
          post 'create', params: params.merge(
            item_id:      item.id,
            item_type:    item.class.name,
            description:  "Test transaction, please ignore",
            splits:       splits_data.to_json
          )
          assert_response :unprocessable_entity
        }.should_not do
          change(person.txns, :count)
          change(issue.txns, :count)
          change(item.txns, :count)
          change(Split, :count)
        end
      end

      it "should require balanced splits" do
        splits_data = [
          { amount: 10, item_id: person.id, item_type: person.class.name },
          { amount: -9, account_id: Account::BountySourceAdjustment.instance.id, account_type: Account::BountySourceAdjustment.name }
        ]

        lambda {
          post 'create', params: params.merge(
            item_id:      item.id,
            item_type:    item.class.name,
            description:  "Test transaction, please ignore",
            splits:       splits_data.to_json
          )
          assert_response :unprocessable_entity
        }.should_not do
          change(person.txns, :count)
          change(issue.txns, :count)
          change(item.txns, :count)
          change(Split, :count)
        end
      end

      it "should create transaction with hella splits" do
        santa_claus = create(:person_with_money_in_account, money_amount: 20000)
        children    = create_list(:person, 20)

        splits_data = [{ amount: -20000, item_id: santa_claus.id, item_type: santa_claus.class.name }]
        splits_data += children.map { |child| { amount: 1000, item_id: child.id, item_type: child.class.name } }

        lambda {
          post 'create', params: params.merge(
            item_id:      item.id,
            item_type:    item.class.name,
            description:  "Test transaction, please ignore",
            splits:       splits_data.to_json
          )
          assert_response :created
        }.should do
          children.each { |child| change(child.txns, :count).by 1 }
          change(santa_claus.txns, :count).by 1
          change(Split, :count).by splits_data.count
        end
      end
    end

    describe "add new splits" do
      let(:person)  { create(:person_with_money_in_account, money_amount: 10) }
      let(:issue)   { create(:issue) }

      it "should add new splits if they are balanced" do
        splits_data = {
          #'0' => { amount: -10, item_id: person.id, item_type: person.class.name },
          #'1' => { amount: 10, item_id: issue.id, item_type: issue.class.name },
          '0' => { amount: -10, item_id: person.id, item_type: person.class.name },
          '1' => { amount: 5, item_id: issue.id, item_type: issue.class.name },
          '2' => { amount: 5, item_id: issue.id, item_type: issue.class.name },
        }

        lambda {
          put :update, params: params.merge(description: transaction.description, splits: splits_data)
          assert_response :ok
          transaction.reload
        }.should change(transaction.splits, :count).by 1
      end

      it "should not add new splits if they are unbalanced" do
        splits_data = {
          '0' => { amount: -9, item_id: person.id, item_type: person.class.name },
          '1' => { amount: 10, item_id: issue.id, item_type: issue.class.name },
        }

        lambda {
          put :update, params: params.merge(splits: splits_data.to_json)
          assert_response :unprocessable_entity
          transaction.reload
        }.should_not change(transaction.splits, :count)
      end
    end

    it "should update transaction description" do
      description = "I've got a lovely bunch of coconuts, there they are standing in a row!"

      lambda {
        put 'update', params: params.merge(description: description)
        assert_response :ok
        transaction.reload
      }.should change(transaction, :description).to description
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

    it "should destroy splits" do
      lambda {
        delete 'destroy', params: params
        assert_response :no_content
      }.should change(Split, :count).by -transaction.splits.count
    end

    it "should destroy transaction" do
      lambda {
        delete 'destroy', params: params
        assert_response :no_content
      }.should change(Transaction, :count).by -1
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
