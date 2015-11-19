# == Schema Information
#
# Table name: gittip_ipns
#
#  id             :integer          not null, primary key
#  txn_id         :string(255)      not null
#  raw_post       :text             not null
#  transaction_id :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_gittip_ipns_on_txn_id  (txn_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :gittip_ipn do
  end
end
