# == Schema Information
#
# Table name: thumbs
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  item_type  :string           not null
#  item_id    :integer          not null
#  explicit   :boolean          not null
#  downvote   :boolean          not null
#  comment_id :integer
#  thumbed_at :datetime         not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_thumbs_on_person_id_and_item_id_and_item_type  (person_id,item_id,item_type) UNIQUE
#

require 'spec_helper'

describe Thumb do
  pending "add some examples to (or delete) #{__FILE__}"
end
