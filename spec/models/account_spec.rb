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
      person.account_balance.should == 10
      person2.account_balance.should == 0
    end

    it "should create accounts on transfer" do
      person.account_balance.should == 10
      person2.account.should be_nil

      Account.transfer!(
        amount: amount,
        from:   person,
        to:     person2
      )

      person.reload.account.should_not be_nil
      person2.reload.account.should_not be_nil
    end

    it "should transfer money between accounts" do
      Account.transfer!(
        amount: amount,
        from:   person,
        to:     person2
      )

      person.reload.account_balance.should == 0
      person2.reload.account_balance.should == 10
    end

    it "should check account balance before transfer" do
      lambda {
        Account.transfer!(
          amount: amount,
          from:   person2,
          to:     person
        )

      }.should raise_exception Account::NotEnoughFunds
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
        lambda{
          Account::TestAccount.instance
        }.should change(Account::TestAccount, :count).by 1

        # try to create a duplicate
        duplicate = Account::TestAccount.create
        duplicate.should_not be_valid
      end
    end

    context "with owner" do
      let(:person) { create(:person) }

      it "should only enfore account uniqueness when creating new account" do
        account1 = Account::Personal.new owner: person
        account2 = Account::Personal.new owner: person

        account1.owner.should == person
        account2.owner.should == person

        # person should not have an account yet, as nothing has been saved
        person.reload.account.should be_nil

        # both accounts should be valid before one of them is saved
        account1.should be_valid
        account2.should be_valid

        account1.save

        # person should now have the saved account
        person.reload.account.should == account1

        # the second account should now be invalid, since another for this item and account type was saved
        account2.should_not be_valid
      end

      it "should allow more than one account of same type with different items" do
        person1 = create(:person)
        person2 = create(:person)

        account1 = Account::Personal.create owner: person1
        account2 = Account::Personal.create owner: person2

        person1.reload.account.should == account1
        person2.reload.account.should == account2
      end

      it "should enforce uniqueness on type and owner" do
        lambda {
          20.times { Account::TestAccount.create owner: person }
        }.should change(Account::TestAccount, :count).by 1
      end
    end

  end

end
