# == Schema Information
#
# Table name: solution_events
#
#  id          :integer          not null, primary key
#  solution_id :integer          not null
#  type        :string(255)      not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_solution_events_on_solution_id  (solution_id)
#  index_solution_events_on_type         (type)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :solution_event do
    association :solution, factory: :solution
    
    factory :started_event, class: SolutionEvent::Started do
    end

    factory :checkedin_event, class: SolutionEvent::CheckedIn do
    end

    factory :stopped_event, class: SolutionEvent::Stopped do
    end

    factory :completed_event, class: SolutionEvent::Completed do
    end

  end
end
