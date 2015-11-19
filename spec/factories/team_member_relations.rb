# == Schema Information
#
# Table name: team_member_relations
#
#  id                   :integer          not null, primary key
#  team_id              :integer          not null
#  person_id            :integer
#  admin                :boolean          default(FALSE), not null
#  developer            :boolean          default(FALSE), not null
#  public               :boolean          default(TRUE), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  invited_by_person_id :integer
#  budget               :decimal(, )
#  balance              :decimal(, )
#  owner_type           :string(255)
#  owner_id             :integer
#  member               :boolean          default(TRUE), not null
#
# Indexes
#
#  index_team_member_relations_on_owner_id               (owner_id)
#  index_team_member_relations_on_owner_type             (owner_type)
#  index_team_member_relations_on_person_id              (person_id)
#  index_team_member_relations_on_person_id_and_team_id  (person_id,team_id) UNIQUE
#  index_team_member_relations_on_team_id                (team_id)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :team_member_relation do
    association :team, factory: :team
    association :person, factory: :person
    
    factory :developer do
      developer true
    end

    factory :admin_member_relation do
      admin true
    end

    factory :non_developer do
      developer false
    end
  end
end
