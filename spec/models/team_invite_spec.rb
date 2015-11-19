# == Schema Information
#
# Table name: team_invites
#
#  id         :integer          not null, primary key
#  team_id    :integer          not null
#  token      :string(255)      not null
#  email      :string(255)
#  admin      :boolean          default(FALSE), not null
#  developer  :boolean          default(FALSE), not null
#  public     :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_team_invites_on_email              (email)
#  index_team_invites_on_email_and_team_id  (email,team_id) UNIQUE
#  index_team_invites_on_team_id            (team_id)
#

require 'spec_helper'

describe TeamInvite do
  let!(:team) { create(:team) }

  it "should generate token when created" do
    invite = create(:team_invite, team: team)
    invite.token.should be_present
  end

  it "should not validate token" do
    TeamInvite.token_valid?(nil).should_not be_truthy
    TeamInvite.token_valid?("such invalid wow").should_not be_truthy
  end

  describe "with invite created" do
    let(:person) { create(:person) }
    let!(:invite) { create(:team_invite, team: team) }

    it "should run uniqueness validations on team invites" do
      dup_invite = TeamInvite.new(team: team, email: "robert.paulson@gmail.com")
      dup_invite.valid?
      expect(dup_invite.errors[:email].size).to eq(1)
    end

    it "should not allow the creation of duplicate team invites" do
      expect {
        TeamInvite.create(team: team, email: "robert.paulson@gmail.com")
      }.not_to change(TeamInvite, :count)
    end

    it "should validate token" do
      TeamInvite.token_valid?(invite.token).should be_truthy
    end

    it "should add person to team" do
      expect {
        invite.accept!(person)
      }.to change(team.members, :count).by 1
    end

    it "should delete invite after acceptance" do
      expect {
        invite.accept!(person)
      }.to change(TeamInvite, :count).by -1
    end

    it "should delete invite on rejection" do
      expect {
        invite.reject!
      }.to change(TeamInvite, :count).by -1
    end

    it "should not change team members on rejection" do
      expect {
        invite.reject!
      }.not_to change(team.members, :count)
    end
  end
end
