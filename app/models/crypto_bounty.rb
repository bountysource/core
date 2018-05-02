# == Schema Information
#
# Table name: crypto_bounties
#
#  id               :integer          not null, primary key
#  amount           :jsonb            not null
#  issue_id         :integer
#  status           :string(12)       default("active"), not null
#  anonymous        :boolean          default(FALSE), not null
#  owner_type       :string
#  owner_id         :integer
#  featured         :boolean          default(FALSE), not null
#  transaction_hash :string           not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_crypto_bounties_on_issue_id                 (issue_id)
#  index_crypto_bounties_on_owner_type_and_owner_id  (owner_type,owner_id)
#

class CryptoBounty < ApplicationRecord
  belongs_to :issue
  belongs_to :owner
end
