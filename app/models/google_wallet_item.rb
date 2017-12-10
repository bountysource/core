# == Schema Information
#
# Table name: google_wallet_items
#
#  id         :integer          not null, primary key
#  order_id   :string(255)      not null
#  jwt        :text             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class GoogleWalletItem < ActiveRecord::Base
  has_many :splits, as: :item
  has_many :txns, through: :splits

  def jwt_data
    @jwt_data ||= Account::GoogleWallet.decode_jwt(jwt)
  end

  # we stringify a JSON object with custom data and pass it through the
  # Wallet flow. It comes back to us in Google's POSTback through their JWT
  def seller_data
    @seller_data ||= Rack::Utils.parse_nested_query(jwt_data['request']['sellerData']).with_indifferent_access
  end

end
