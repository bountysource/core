# == Schema Information
#
# Table name: support_levels
#
#  id                     :integer          not null, primary key
#  person_id              :integer          not null
#  team_id                :integer          not null
#  amount                 :decimal(10, 2)   not null
#  status                 :string           not null
#  owner_type             :string
#  owner_id               :integer
#  payment_method_id      :integer          not null
#  created_at             :datetime
#  updated_at             :datetime
#  reward_id              :integer
#  last_invoice_starts_at :date
#  last_invoice_ends_at   :date
#  canceled_at            :datetime
#
# Indexes
#
#  index_support_levels_on_person_id  (person_id)
#  index_support_levels_on_reward_id  (reward_id)
#  index_support_levels_on_team_id    (team_id)
#

FactoryBot.define do
  factory :support_level do
    association :person, factory: :person
    association :team, factory: [:team, :accepts_public_payins]
    association :payment_method, factory: :payment_method_paypal, strategy: :build
    status { 'pending' }
    amount { 10 }

    after(:build) do |support_level|
      support_level.payment_method.person = support_level.person
    end
  end
end
