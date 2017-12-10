# == Schema Information
#
# Table name: tracker_donations
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  tracker_id :integer          not null
#  amount     :decimal(10, 2)   not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class TrackerDonation < ActiveRecord::Base
  belongs_to :person
  belongs_to :tracker

  has_many :splits, :as => :item
  has_many :txns, :through => :splits
end
