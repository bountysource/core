# == Schema Information
#
# Table name: team_invites
#
#  id         :integer          not null, primary key
#  team_id    :integer          not null
#  token      :string(255)      not null
#  email      :string(255)
#  admin      :boolean          default(FALSE), not null
#  developer  :boolean          default(FALSE), not null
#  public     :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_team_invites_on_email              (email)
#  index_team_invites_on_email_and_team_id  (email,team_id) UNIQUE
#  index_team_invites_on_team_id            (team_id)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :team_invite do
    email "robert.paulson@gmail.com"
  end
end
