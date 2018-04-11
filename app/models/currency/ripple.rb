# == Schema Information
#
# Table name: currencies
#
#  id         :integer          not null, primary key
#  type       :string(255)      not null
#  value      :decimal(, )      not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_currencies_on_type   (type)
#  index_currencies_on_value  (value)
#

class Currency::Ripple < Currency

  def self.sync
    model = first || new

    response = HTTParty.get('http://rippleprice.com/wp-content/themes/ripple/priceinfo.txt')

    if response.success?
      # TODO security audit. slightly risky invoking #to_f on this,
      # but it seems legit enough to ship for now.
      model.value = response.parsed_response.to_f

      model.save
    end
  end

  def self.display_name
    'ripple'
  end

end
