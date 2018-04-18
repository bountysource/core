# == Schema Information
#
# Table name: people
#
#  id                   :integer          not null, primary key
#  first_name           :string
#  last_name            :string
#  display_name         :string
#  email                :string           not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  buyer_id             :string
#  password_digest      :string
#  account_completed    :boolean          default(FALSE)
#  paypal_email         :string
#  last_seen_at         :datetime
#  last_bulk_mailed_at  :datetime
#  admin                :boolean          default(FALSE)
#  bio                  :text
#  location             :string
#  url                  :string
#  company              :string
#  public_email         :string
#  accepted_terms_at    :datetime
#  cloudinary_id        :string
#  deleted              :boolean          default(FALSE), not null
#  profile_completed    :boolean          default(FALSE), not null
#  shopping_cart_id     :integer
#  stripe_customer_id   :string
#  suspended_at         :datetime
#  bounty_hunter        :boolean
#  quickbooks_vendor_id :integer
#  reset_digest         :string
#  reset_sent_at        :datetime
#  confirmation_token   :string
#  confirmed_at         :datetime
#  confirmation_sent_at :datetime
#  unconfirmed_email    :string
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
    confirmed_at { Time.now }
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
