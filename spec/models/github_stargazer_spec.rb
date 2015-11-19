# == Schema Information
#
# Table name: github_stargazers
#
#  id                :integer          not null, primary key
#  linked_account_id :integer          not null
#  tracker_id        :integer          not null
#  stargazer         :boolean
#  subscriber        :boolean
#  forker            :boolean
#  synced_at         :datetime
#  created_at        :datetime
#  updated_at        :datetime
#

require 'rails_helper'

RSpec.describe GithubStargazer, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
