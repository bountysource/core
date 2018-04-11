# == Schema Information
#
# Table name: people
#
#  id                   :integer          not null, primary key
#  first_name           :string(255)
#  last_name            :string(255)
#  display_name         :string(255)
#  email                :string(255)      not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  buyer_id             :string(255)
#  password_digest      :string(255)
#  account_completed    :boolean          default(FALSE)
#  paypal_email         :string(255)
#  last_seen_at         :datetime
#  last_bulk_mailed_at  :datetime
#  admin                :boolean          default(FALSE)
#  bio                  :text
#  location             :string(255)
#  url                  :string(255)
#  company              :string(255)
#  public_email         :string(255)
#  accepted_terms_at    :datetime
#  cloudinary_id        :string(255)
#  deleted              :boolean          default(FALSE), not null
#  profile_completed    :boolean          default(FALSE), not null
#  shopping_cart_id     :integer
#  stripe_customer_id   :string(255)
#  suspended_at         :datetime
#  bounty_hunter        :boolean
#  quickbooks_vendor_id :integer
#  reset_digest         :string
#  reset_sent_at        :datetime
#
# Indexes
#
#  index_people_on_email             (email) UNIQUE
#  index_people_on_shopping_cart_id  (shopping_cart_id)
#

FactoryBot.define do

  factory :person, class: Person do
    first_name { 'John' }
    last_name { 'Doe' }
    sequence(:email) { |n| "qa+test-#{n}@bountysource.com" }

    pw = 'abcd1234'
    password { pw }
    password_confirmation { pw }

    factory :person_with_address do
      after(:create) {|person| create(:address, person: person)}
    end

    factory :person_with_money_in_account do
      transient do
        money_amount { 10 }
      end

      after(:create) do |person, evaluator|
        Transaction::InternalTransfer::Promotional.gift_to_with_amount(person, evaluator.money_amount)
        person.reload
      end
    end

    factory :backer do
      after(:create) do |person|
        create(:bounty, person: person)
      end
    end

    factory :person_with_facebook_account do
      after(:create) { |person| create(:facebook_account, person: person) }
    end

    factory :person_with_twitter_account do
      after(:create) { |person| create(:twitter_account, person: person) }
    end

    factory :person_with_github_account do
      after(:create) { |person| create(:github_account, person: person) }
    end
  end

end
