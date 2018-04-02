# == Schema Information
#
# Table name: solution_events
#
#  id          :integer          not null, primary key
#  solution_id :integer          not null
#  type        :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_solution_events_on_solution_id  (solution_id)
#  index_solution_events_on_type         (type)
#

class SolutionEvent < ApplicationRecord
  belongs_to :solution
  validates :type, presence: true
  validates :solution, presence: true
end
