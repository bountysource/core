# == Schema Information
#
# Table name: lurkers
#
#  id         :integer          not null, primary key
#  remote_ip  :string(255)      not null
#  user_agent :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_lurkers_on_remote_ip_and_user_agent  (remote_ip,user_agent) UNIQUE
#

class Lurker < ActiveRecord::Base
  has_many :activity_logs
end
