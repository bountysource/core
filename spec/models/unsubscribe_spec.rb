# == Schema Information
#
# Table name: unsubscribes
#
#  id                :integer          not null, primary key
#  person_id         :integer
#  linked_account_id :integer
#  email             :string
#  category          :string
#  created_at        :datetime
#  updated_at        :datetime
#
# Indexes
#
#  index_unsubscribes_on_email              (email)
#  index_unsubscribes_on_linked_account_id  (linked_account_id)
#  index_unsubscribes_on_person_id          (person_id)
#

require 'rails_helper'

RSpec.describe Unsubscribe, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
