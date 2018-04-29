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

require 'spec_helper'

describe SupportOffering do
  pending "add some examples to (or delete) #{__FILE__}"
end
