# == Schema Information
#
# Table name: pledge_survey_responses
#
#  id              :integer          not null, primary key
#  person_id       :integer          not null
#  reward_id       :integer          not null
#  survey_response :text             not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_pledge_survey_responses_on_person_id  (person_id)
#  index_pledge_survey_responses_on_reward_id  (reward_id)
#

class PledgeSurveyResponse < ApplicationRecord
  belongs_to :person
  belongs_to :reward
  has_one :fundraiser, through: :reward

  validates :person, presence: true
  validates :reward, presence: true

end
