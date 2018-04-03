# == Schema Information
#
# Table name: lurkers
#
#  id         :integer          not null, primary key
#  remote_ip  :string           not null
#  user_agent :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_lurkers_on_remote_ip_and_user_agent  (remote_ip,user_agent) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :lurker do
    user_agent "Chrome"
    remote_ip "193.253.1.2"
  end
end
