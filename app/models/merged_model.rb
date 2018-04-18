# == Schema Information
#
# Table name: merged_models
#
#  id         :integer          not null, primary key
#  good_id    :integer          not null
#  bad_id     :integer          not null
#  bad_type   :string           not null
#  created_at :datetime         not null
#
# Indexes
#
#  index_merged_models_on_bad_id_and_bad_type  (bad_id,bad_type) UNIQUE
#

class MergedModel < ApplicationRecord
end
