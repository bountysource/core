require 'spec_helper'

describe Api::V2::CashOutsController do
  let(:person) { create(:person) }
  let(:cash_out) { create(:cash_out, person: person, account: person.create_account) }

  before do
    allow_any_instance_of(Api::BaseController).to receive(:current_user).and_return(person)
    allow(CashOut).to receive(:parse).and_return(cash_out)
    allow(cash_out).to receive(:save!)
    allow(cash_out).to receive(:hold_amount!)
  end

  describe 'create' do
    let(:action) { post(:create) }

    it 'should create' do
      expect(cash_out).to receive(:save!).once
      action
      expect(response.status).to eq(201)
    end

    it 'should require auth' do
      allow_any_instance_of(Api::BaseController).to receive(:current_user).and_return(nil)
      action
      expect(response.status).to eq(401)
    end
  end
end
