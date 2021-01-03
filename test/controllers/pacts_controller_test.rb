# == Schema Information
#
# Table name: pacts
#
#  id                  :bigint(8)        not null, primary key
#  project_name        :string
#  type                :string
#  experience_level    :string
#  time_commitment     :string
#  issue_type          :string
#  expires_at          :datetime
#  paid_at             :datetime
#  link                :string
#  issue_url           :string
#  project_description :string
#  amount              :decimal(10, 2)   not null
#  person_id           :integer
#  owner_type          :string
#  owner_id            :integer
#  featured            :boolean          default(FALSE), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

require 'test_helper'

class PactsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get pacts_index_url
    assert_response :success
  end

end
