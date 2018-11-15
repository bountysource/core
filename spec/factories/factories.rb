FactoryBot.define do
  factory :paypal_ipn do
    txn_id { "0FR017006U837124K" }
  end

  factory :facebook_account, class: LinkedAccount::Facebook do
    sequence(:uid) { |n| 10000 + n }
    oauth_token SecureRandom.urlsafe_base64(128)
  end

  factory :twitter_account, class: LinkedAccount::Twitter do
    sequence(:uid) { |n| 20000 + n }
    oauth_token SecureRandom.urlsafe_base64(128)
    oauth_secret SecureRandom.urlsafe_base64(128)
  end

  factory :github_account, class: LinkedAccount::Github::User do
    sequence(:uid) { |n| 30000 + n }
    sequence(:login) { |n| "leeroy_jenkins#{n}" }
    oauth_token SecureRandom.urlsafe_base64(128)
  end

  factory :split do
    amount 10
  end
end

