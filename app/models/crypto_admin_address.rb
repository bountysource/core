# == Schema Information
#
# Table name: crypto_admin_addresses
#
#  id             :bigint(8)        not null, primary key
#  public_address :string           not null
#  type           :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_crypto_admin_addresses_on_public_address  (public_address) UNIQUE
#

class CryptoAdminAddress < ApplicationRecord
end
