# == Schema Information
#
# Table name: crypto_pay_outs
#
#  id                  :bigint(8)        not null, primary key
#  issue_id            :bigint(8)
#  person_id           :bigint(8)
#  type                :string(255)      not null
#  state               :string           default("Pending-Approval")
#  receiver_address    :string
#  funder_acct_address :string
#  fee_percent         :decimal(, )
#  fee                 :jsonb
#  fees_acct_address   :string
#  sent_at             :datetime
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  seed_eth            :decimal(, )
#  balance             :jsonb
#  bounty              :jsonb
#  is_refund           :boolean          default(FALSE), not null
#  transaction_hash    :string
#  reason              :string
#
# Indexes
#
#  index_crypto_pay_outs_on_issue_id          (issue_id)
#  index_crypto_pay_outs_on_person_id         (person_id)
#  index_crypto_pay_outs_on_sent_at           (sent_at)
#  index_crypto_pay_outs_on_state             (state)
#  index_crypto_pay_outs_on_transaction_hash  (transaction_hash) UNIQUE
#  index_crypto_pay_outs_on_type              (type)
#

class CryptoPayOut < ApplicationRecord
  self.inheritance_column = nil
  has_many :crypto_pay_out_txns

  belongs_to :issue
  belongs_to :person

  STATUSES = ['Pending-Approval', 'Seeded', 'In-Progress', 'Completed']

end
