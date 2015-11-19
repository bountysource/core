# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :team_payin do
    association :team, factory: :team
    association :person, factory: :person
    amount 100
    # add associated account?
  end
end
