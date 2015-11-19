require 'spec_helper'

describe Transaction::InternalTransfer::Promotional do

  let!(:person) { create(:person) }
  let(:account) { person.create_account }
  let(:action) {  -> { Transaction::InternalTransfer::Promotional.gift_to_with_amount person, 100 } }

  it 'should give money to person' do
    expect(action).to change(account, :balance).by 100
  end

  it 'should increase liability' do
    expect(action).to change(Account::Liability.instance, :balance).by -100
  end

end