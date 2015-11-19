# == Schema Information
#
# Table name: proposals
#
#  id                      :integer          not null, primary key
#  request_for_proposal_id :integer          not null
#  person_id               :integer          not null
#  amount                  :decimal(10, 2)   not null
#  estimated_work          :integer
#  bio                     :string(1000)
#  state                   :string(255)      default("pending")
#  created_at              :datetime
#  updated_at              :datetime
#  completed_by            :datetime
#  team_notes              :text
#
# Indexes
#
#  index_proposals_on_amount                                 (amount)
#  index_proposals_on_person_id                              (person_id)
#  index_proposals_on_person_id_and_request_for_proposal_id  (person_id,request_for_proposal_id) UNIQUE
#  index_proposals_on_request_for_proposal_id                (request_for_proposal_id)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :proposal do
    association :request_for_proposal, factory: :request_for_proposal
    association :person, factory: :person
    amount 5
    estimated_work 1
    bio "MyString"
  end
end
