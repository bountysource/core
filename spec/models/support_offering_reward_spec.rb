# == Schema Information
#
# Table name: support_offering_rewards
#
#  id                          :integer          not null, primary key
#  support_offering_id         :integer          not null
#  amount                      :decimal(10, 2)   not null
#  title                       :string(255)
#  description                 :text
#  active_support_levels_count :integer          default(0), not null
#  deleted_at                  :datetime
#  created_at                  :datetime
#  updated_at                  :datetime
#
# Indexes
#
#  index_support_offering_rewards_on_support_offering_id  (support_offering_id)
#

require 'rails_helper'

RSpec.describe SupportOfferingReward, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
