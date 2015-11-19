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

require 'spec_helper'

describe TeamMemberRelation do
  let(:team) { create(:team) }
  let(:non_developer) { create(:non_developer, team: team) }
  let(:developer) { create(:developer, team: team) }
  let(:developer_with_budget) { create(:developer, team: team, budget: 100, balance: 100) }

  describe "validations" do
    it "should require the budget amount to be greater than or equal to 0" do
      build(:developer, budget: -2).valid?.should be_falsey
    end

    it "should require a budget amount to be set on relations that have developer privileges" do
      build(:non_developer, budget: 20).valid?.should be_falsey
    end
  end

  describe "#set_budget" do
    it "should not set the budget unless the team member is a developer" do
      developer.set_budget(100.00)
      developer.budget.should eq(100)
    end
  end

  describe "#delete_budget" do
    #if you don't want a developer to spend, remove their dev privileges.
    #nil => unlimited spending power for a team
    it "should set a developer's budget to nil" do
      developer_with_budget.delete_budget
      developer_with_budget.budget.should eq(nil)
    end
  end

  describe "#update_balance" do
    it "should update a developer's remaining balance" do
      developer_with_budget.update_balance(10)
      developer_with_budget.balance.should eq(90)
    end
  end
end
