require 'spec_helper'
require 'rails_helper'

describe Api::V0::CashOutsController do
  let(:person) { create(:person) }
  let(:cash_out) { create(:cash_out, person: person, account: person.create_account) }
  let(:time) { "13 October 1993".to_datetime }

  before do
    Api::V0::BaseController.any_instance.stub(:require_admin)
    expect(CashOut).to receive(:find).with("1").and_return(cash_out)
  end

  describe 'update' do
    it 'should set approved time if approved' do
        Timecop.freeze(time) do
            put :update, :id => "1", :approved => true, format: :json

            expect(cash_out.approved_at).to eq(time)
        end
    end

    it 'should set approved to nil if unapproved' do
        put :update, :id => "1", :approved => false, format: :json

        expect(cash_out.approved_at).to eq(nil)
    end
  end
end
