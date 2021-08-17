# == Schema Information
#
# Table name: team_payins
#
#  id          :integer          not null, primary key
#  team_id     :integer          not null
#  amount      :decimal(, )      not null
#  person_id   :integer
#  consumed    :boolean          default(FALSE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  owner_type  :string
#  owner_id    :integer
#  from_member :boolean          default(FALSE)
#  refunded_at :datetime
#
# Indexes
#
#  index_team_payins_on_amount                   (amount)
#  index_team_payins_on_owner_type_and_owner_id  (owner_type,owner_id)
#  index_team_payins_on_person_id                (person_id)
#  index_team_payins_on_refunded_at              (refunded_at) WHERE (refunded_at IS NOT NULL)
#  index_team_payins_on_team_id                  (team_id)
#

require 'spec_helper'

describe TeamPayin do
  let(:team) { create(:team) }
  let(:person) { create(:person) }
  let(:team_payin) { create(:team_payin, team: team) }

  describe "#after_purchase callback" do
    it "should set consumed to true" do
      # order = double()
      # team_payin.after_purchase(order)
      # team_payin.consumed.should be_truthy
    end
  end

  describe "#notify_admins" do
    #move these into a service object easier for testing
    let!(:team_member_relation) { create(:admin_member_relation, team: team, person: person) }

    it "should call send_email for every admin" do
      # person.should_receive(:send_email).with(:team_account_funded_admin, anything)
      #procedure creates two emails: one for account create/ one for team_funded
      # this is a terrible test -- sean
      expect {
        team_payin.notify_admins
      }.to change(SentEmail, :count).by 2
    end
  end
end
