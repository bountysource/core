# == Schema Information
#
# Table name: support_levels
#
#  id                     :integer          not null, primary key
#  person_id              :integer          not null
#  team_id                :integer          not null
#  amount                 :decimal(10, 2)   not null
#  status                 :string(255)      not null
#  owner_type             :string(255)
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

require 'spec_helper'

describe SupportLevel do

  describe '#create' do
    let(:support_level) { create(:support_level) }

    it 'has an amount' do
      expect(support_level.amount.to_i).to equal(10)
    end
  end

end
