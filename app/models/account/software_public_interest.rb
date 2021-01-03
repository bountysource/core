# == Schema Information
#
# Table name: accounts
#
#  id                      :integer          not null, primary key
#  type                    :string           default("Account"), not null
#  description             :string           default(""), not null
#  currency                :string           default("USD"), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  owner_id                :integer
#  owner_type              :string
#  standalone              :boolean          default(FALSE)
#  override_fee_percentage :integer
#
# Indexes
#
#  index_accounts_on_item_id    (owner_id)
#  index_accounts_on_item_type  (owner_type)
#  index_accounts_on_type       (type)
#

class Account::SoftwarePublicInterest < Account
end
