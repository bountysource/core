# == Schema Information
#
# Table name: pacts
#
#  id                  :bigint(8)        not null, primary key
#  project_name        :string
#  pact_type           :string
#  experience_level    :string
#  time_commitment     :string
#  issue_type          :string
#  expires_at          :datetime
#  paid_at             :datetime
#  link                :string
#  issue_url           :string
#  project_description :string
#  bounty_total        :decimal(10, 2)   default(0.0), not null
#  person_id           :integer
#  owner_type          :string
#  owner_id            :integer
#  featured            :boolean          default(FALSE), not null
#  can_add_bounty      :boolean          default(TRUE), not null
#  solution_started    :boolean          default(FALSE), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

require 'test_helper'

class PactTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
