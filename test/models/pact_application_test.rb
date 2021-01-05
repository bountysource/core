# == Schema Information
#
# Table name: pact_applications
#
#  id              :bigint(8)        not null, primary key
#  person_id       :bigint(8)
#  pact_id         :bigint(8)
#  note            :string
#  completion_date :datetime
#  status          :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_pact_applications_on_pact_id    (pact_id)
#  index_pact_applications_on_person_id  (person_id)
#

require 'test_helper'

class PactApplicationTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
