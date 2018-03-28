# == Schema Information
#
# Table name: accounts
#
#  id          :integer          not null, primary key
#  type        :string(255)      default("Account"), not null
#  description :string(255)      default(""), not null
#  currency    :string(255)      default("USD"), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  owner_id    :integer
#  owner_type  :string(255)
#  standalone  :boolean          default(FALSE)
#
# Indexes
#
#  index_accounts_on_item_id    (owner_id)
#  index_accounts_on_item_type  (owner_type)
#  index_accounts_on_type       (type)
#

  require 'spec_helper'

describe Account do

  describe 'transfers' do
    let!(:person)   { create(:person_with_money_in_account, money_amount: 10.00) }
    let!(:person2)  { create(:person) }
    let(:amount)    { Money.new 10 * 100, 'USD' }
    let(:invalid_amount) { Money.new 99999 * 100, 'USD' }

    specify do
      expect(person.account_balance).to eq(10)
      expect(person2.account_balance).to eq(0)
    end

    it "should create accounts on transfer" do
      expect(person.account_balance).to eq(10)
      expect(person2.account).to be_nil

      Account.transfer!(
        amount: amount,
        from:   person,
        to:     person2
      )

      expect(person.reload.account).not_to be_nil
      expect(person2.reload.account).not_to be_nil
    end

    it "should transfer money between accounts" do
      Account.transfer!(
        amount: amount,
        from:   person,
        to:     person2
      )

      expect(person.reload.account_balance).to eq(0)
      expect(person2.reload.account_balance).to eq(10)
    end

    it "should check account balance before transfer" do
      expect {
        Account.transfer!(
          amount: amount,
          from:   person2,
          to:     person
        )

      }.to raise_exception Account::NotEnoughFunds
    end
  end

  describe 'duplicate account countermeasures' do
    # a test of account, of a nonexistent type
    class Account::TestAccount < Account; end

    # manually destroy all of the test accounts that were created
    after { Account::TestAccount.destroy_all }

    context "without owner" do
      it "should enforce uniqueness on type" do
        # create the first account
        expect{
          Account::TestAccount.instance
        }.to change(Account::TestAccount, :count).by 1

        # try to create a duplicate
        duplicate = Account::TestAccount.create
        expect(duplicate).not_to be_valid
      end
    end

    context "with owner" do
      let(:person) { create(:person) }

      it "should only enfore account uniqueness when creating new account" do
        account1 = Account::Personal.new owner: person
        account2 = Account::Personal.new owner: person

        expect(account1.owner).to eq(person)
        expect(account2.owner).to eq(person)

        # person should not have an account yet, as nothing has been saved
        expect(person.reload.account).to be_nil

        # both accounts should be valid before one of them is saved
        expect(account1).to be_valid
        expect(account2).to be_valid

        account1.save

        # person should now have the saved account
        expect(person.reload.account).to eq(account1)

        # the second account should now be invalid, since another for this item and account type was saved
        expect(account2).not_to be_valid
      end

      it "should allow more than one account of same type with different items" do
        person1 = create(:person)
        person2 = create(:person)

        account1 = Account::Personal.create owner: person1
        account2 = Account::Personal.create owner: person2

        expect(person1.reload.account).to eq(account1)
        expect(person2.reload.account).to eq(account2)
      end

      it "should enforce uniqueness on type and owner" do
        expect {
          20.times { Account::TestAccount.create owner: person }
        }.to change(Account::TestAccount, :count).by 1
      end
    end

  end

end
