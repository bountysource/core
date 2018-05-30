# == Schema Information
#
# Table name: support_offerings
#
#  id                :integer          not null, primary key
#  team_id           :integer          not null
#  subtitle          :string(255)
#  body_markdown     :text
#  youtube_video_url :string(255)
#  goals             :json
#  created_at        :datetime
#  updated_at        :datetime
#  extra             :json
#
# Indexes
#
#  index_support_offerings_on_team_id  (team_id) UNIQUE
#

class SupportOffering < ApplicationRecord
  has_paper_trail :only => [:subtitle, :body_markdown, :youtube_video_url, :goals]

  has_many :rewards, class_name: 'SupportOfferingReward'
  belongs_to :team

  def next_goal
    (goals||[]).sort_by { |goal| goal['amount'].to_f }.each do |goal|
      if goal['amount'].to_f > (team.monthly_contributions_sum||0)
        return goal['amount'].to_f
      end
    end
    return 1000
  end

  def sanitized_goals
    (goals||[]).map { |goal| { amount: 0 }.merge(goal.reject { |k,v| v.nil? }) }
  end

  def sanitized_extra
    extra || {}
  end
end
