# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :bounty_claim_response do
    association :person, factory: :person
    association :bounty_claim
    
    factory :accepted_bounty_claim_response, class: BountyClaimResponse do
      value true
    end

    factory :rejected_bounty_claim_response, class: BountyClaimResponse do
      value false
    end

  end
end
