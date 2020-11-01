require 'spec_helper'

describe ChargeUserInactivityFee do
  before(:each) do
    @inactive_person = create(:person, last_seen_at: 90.days.ago)
  end

  it 'charges a user the correct fee' do
    transaction = create(:transaction)
    create(:split, item: @inactive_person, amount: 1000, txn: transaction, created_at: 90.days.ago)
    create(:split, account: Account::Liability.instance, amount: -1000, txn: transaction, created_at: 90.days.ago)

    ChargeUserInactivityFee.charge!

    @inactive_person.reload
    expect(@inactive_person.account.balance).to eq 891
    expect(Account::InactivityFee.instance.balance).to eq 109
  end

  it 'charges a fee rounded to 2 decimals' do
    transaction = create(:transaction)
    create(:split, item: @inactive_person, amount: 899.55, txn: transaction, created_at: 90.days.ago)
    create(:split, account: Account::Liability.instance, amount: -899.55, txn: transaction, created_at: 90.days.ago)

    ChargeUserInactivityFee.charge!

    @inactive_person.reload
    expect(@inactive_person.account.balance).to eq 800.60
    expect(Account::InactivityFee.instance.balance).to eq 98.95
  end

  it 'charges a fee that sets the balance to be 0 if less than 10 remaining' do
    transaction = create(:transaction)
    create(:split, item: @inactive_person, amount: 8.99, txn: transaction, created_at: 90.days.ago)
    create(:split, account: Account::Liability.instance, amount: -8.99, txn: transaction, created_at: 90.days.ago)

    ChargeUserInactivityFee.charge!

    @inactive_person.reload
    expect(@inactive_person.account.balance).to eq 0
    expect(Account::InactivityFee.instance.balance).to eq 8.99
  end

  it 'does not double charge a user in a single month' do

    transaction = create(:transaction)
    create(:split, item: @inactive_person, amount: 1000, txn: transaction, created_at: 90.days.ago)
    create(:split, account: Account::Liability.instance, amount: -1000, txn: transaction, created_at: 90.days.ago)

    ChargeUserInactivityFee.charge!
    ChargeUserInactivityFee.charge!

    @inactive_person.reload
    expect(@inactive_person.account.balance).to eq 891
    expect(Account::InactivityFee.instance.balance).to eq 109
  end

  it 'charges multiple users if both are valid' do
    @inactive_person_2 = create(:person, last_seen_at: 200.days.ago)

    transaction = create(:transaction)
    create(:split, item: @inactive_person, amount: 8.99, txn: transaction, created_at: 90.days.ago)
    create(:split, account: Account::Liability.instance, amount: -8.99, txn: transaction, created_at: 90.days.ago)

    transaction = create(:transaction)
    create(:split, item: @inactive_person_2, amount: 1000, txn: transaction, created_at: 90.days.ago)
    create(:split, account: Account::Liability.instance, amount: -1000, txn: transaction, created_at: 90.days.ago)

    ChargeUserInactivityFee.charge!

    @inactive_person.reload
    @inactive_person_2.reload
    expect(@inactive_person.account.balance).to eq 0
    expect(@inactive_person_2.account.balance).to eq 891
    expect(Account::InactivityFee.instance.balance).to eq 117.99
  end

  it 'can charge a user every month' do
    transaction = create(:transaction)
    create(:split, item: @inactive_person, amount: 1000, txn: transaction, created_at: 90.days.ago)
    create(:split, account: Account::Liability.instance, amount: -1000, txn: transaction, created_at: 90.days.ago)

    ChargeUserInactivityFee.charge!

    Timecop.freeze(Time.zone.now + 30.days) do
      ChargeUserInactivityFee.charge!
      @inactive_person.reload
      expect(@inactive_person.account.balance).to eq 792.9
      expect(Account::InactivityFee.instance.balance).to eq 207.1
    end
    Timecop.return    
  end
end
