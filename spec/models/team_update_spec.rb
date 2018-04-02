# == Schema Information
#
# Table name: team_updates
#
#  id            :integer          not null, primary key
#  number        :integer
#  title         :string
#  body          :text
#  published     :boolean          default(FALSE), not null
#  published_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  team_id       :integer          not null
#  mailing_lists :json
#
# Indexes
#
#  index_team_updates_on_published           (published)
#  index_team_updates_on_team_id_and_number  (team_id,number) UNIQUE
#

require 'spec_helper'

describe TeamUpdate do
  describe "unsubscribe from emails" do
    let(:person) { create(:person) }

    it "should receive update emails by default" do
      expect(Unsubscribe.d?(person, 'team_updates')).to be_falsey
      expect(create(:team_update).send(:send_one_email, person_id: person.id)).not_to be_nil
    end

    it "should not receive update emails if opted out to all teams" do
      Unsubscribe.create!(person: person, category: 'team_updates')
      expect(Unsubscribe.d?(person, 'team_updates')).to be_truthy
      expect(create(:team_update).send(:send_one_email, person_id: person.id)).to be_nil
    end

    it "should not receive update emails if opted out to all teams" do
      Unsubscribe.create!(person: person, category: 'all')
      expect(Unsubscribe.d?(person, 'all')).to be_truthy
      expect(create(:team_update).send(:send_one_email, person_id: person.id)).to be_nil
    end

    it "should not receive update emails if opted out to specific team" do
      team_update = create(:team_update)
      Unsubscribe.create!(person: person, category: "team_updates_#{team_update.team_id}")
      expect(Unsubscribe.d?(person, "team_updates_#{team_update.team_id}")).to be_truthy
      expect(Unsubscribe.d?(person, "team_updates")).to be_falsey
      expect(team_update.send(:send_one_email, person_id: person.id)).to be_nil
    end
  end

end
