# == Schema Information
#
# Table name: sent_emails
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  template   :string           not null
#  options    :text             default({}), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class SentEmail < ApplicationRecord
  belongs_to :person

  serialize :options

  validates :person, presence: true
  validates :template, presence: true
end
