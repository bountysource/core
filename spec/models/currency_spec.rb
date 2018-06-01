# == Schema Information
#
# Table name: currencies
#
#  id            :integer          not null, primary key
#  type          :string(255)      not null
#  value         :decimal(, )
#  created_at    :datetime
#  updated_at    :datetime
#  name          :string
#  symbol        :string
#  address       :string
#  cloudinary_id :string
#  featured      :boolean
#
# Indexes
#
#  index_currencies_on_symbol  (symbol)
#  index_currencies_on_type    (type)
#  index_currencies_on_value   (value)
#

require 'spec_helper'

describe Currency do
end
