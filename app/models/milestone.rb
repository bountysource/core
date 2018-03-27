# == Schema Information
#
# Table name: milestones
#
#  id                    :integer          not null, primary key
#  fundraiser_id         :integer          not null
#  delivery_at           :datetime
#  percentage_of_project :integer
#  description           :string(255)      not null
#  completed_percentage  :integer          not null
#  optional              :boolean          default(FALSE), not null
#  rank                  :integer          default(1), not null
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#

class Milestone < ActiveRecord::Base
  belongs_to :fundraiser

  validates :rank, numericality: { greater_than_or_equal: 1 }
  validates :percentage_of_project, numericality: { greater_than_or_equal: 1, less_than_or_equal: 100 }
  validates :completed_percentage, numericality: { greater_than_or_equal: 1, less_than_or_equal: 100 }
  validates :optional, :inclusion => { in: [true, false] }
  validates :description, presence: true
end
