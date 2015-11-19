require 'spec_helper'

describe Api::V2::CashOutsController do
  let(:person) { create(:person) }
  let(:cash_out) { create(:cash_out, person: person, account: person.create_account) }

  before do
    Api::BaseController.any_instance.stub(:current_user).and_return(person)
    CashOut.stub(:parse).and_return(cash_out)
    cash_out.stub(:save!)
    cash_out.stub(:hold_amount!)
  end

  describe 'create' do
    let(:action) { post(:create) }

    it 'should create' do
      expect(cash_out).to receive(:save!).once
      action
      expect(response.status).to eq(201)
    end

    it 'should require auth' do
      Api::BaseController.any_instance.stub(:current_user).and_return(nil)
      action
      expect(response.status).to eq(401)
    end
  end
end
