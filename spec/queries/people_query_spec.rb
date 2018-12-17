require 'spec_helper'

describe PeopleQuery do
  context '.inactive_since' do
    it 'returns the right users' do
      not_recently_seen_without_balance = create(:person, last_seen_at: 200.days.ago)
      
      recent_last_seen = create(:person, last_seen_at: 89.days.ago)

      not_recently_seen_with_recent_transaction = create(:person, last_seen_at: 100.days.ago)
      transaction = create(:transaction)
      create(:split, item: not_recently_seen_with_recent_transaction, amount: 1000, txn: transaction)
      create(:split, account: Account::Liability.instance, amount: 1000, txn: transaction)

      truly_inactive_with_balance = create(:person, last_seen_at: 91.days.ago)
      transaction = create(:transaction)
      create(:split, item: truly_inactive_with_balance, amount: 1000, txn: transaction, created_at: 100.days.ago)
      create(:split, account: Account::Liability.instance, amount: 1000, txn: transaction, created_at: 100.days.ago)

      results = PeopleQuery.new.inactive_since(90.days.ago)

      expect(results).to contain_exactly(truly_inactive_with_balance)      
    end

    it 'returns the user with a balance virtual attributes' do
      inactive_person_with_balance = create(:person, last_seen_at: 100.days.ago)
      transaction = create(:transaction)
      create(:split, item: inactive_person_with_balance, amount: 1000, txn: transaction, created_at: 100.days.ago)
      create(:split, account: Account::Liability.instance, amount: 1000, txn: transaction, created_at: 100.days.ago)

      results = PeopleQuery.new.inactive_since(Time.zone.now - 90.days)

      expect(results[0].balance).to eq 1000
    end

    it 'returns a user with a previous inactivity fee split' do
      person = create(:person, last_seen_at: 200.days.ago)

      transaction = create(:transaction)
      create(:split, item: person, amount: 1000, txn: transaction, created_at: 100.days.ago)
      create(:split, account: Account::Liability.instance, amount: 1000, txn: transaction, created_at: 100.days.ago)

      ChargeUserInactivityFee.charge!

      results = PeopleQuery.new.inactive_since(90.days.ago)

      expect(results).to contain_exactly person
    end
  end
end
