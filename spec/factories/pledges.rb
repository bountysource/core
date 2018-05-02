# == Schema Information
#
# Table name: pledges
#
#  id              :integer          not null, primary key
#  fundraiser_id   :integer
#  person_id       :integer
#  amount          :decimal(10, 2)   not null
#  status          :string(12)       default("active")
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  reward_id       :integer
#  survey_response :text
#  anonymous       :boolean          default(FALSE), not null
#  owner_type      :string(255)
#  owner_id        :integer
#
# Indexes
#
#  index_pledges_on_anonymous   (anonymous)
#  index_pledges_on_owner_id    (owner_id)
#  index_pledges_on_owner_type  (owner_type)
#  index_pledges_on_status      (status)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :pledge do
    association :fundraiser, factory: :fundraiser
    association :person, factory: :person
    amount 10.0
  end
end
