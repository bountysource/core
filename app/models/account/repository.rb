# == Schema Information
#
# Table name: accounts
#
#  id                      :integer          not null, primary key
#  type                    :string(255)      default("Account"), not null
#  description             :string(255)      default(""), not null
#  currency                :string(255)      default("USD"), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  owner_id                :integer
#  owner_type              :string(255)
#  standalone              :boolean          default(FALSE)
#  override_fee_percentage :integer
#
# Indexes
#
#  index_accounts_on_item_id    (owner_id)
#  index_accounts_on_item_type  (owner_type)
#  index_accounts_on_type       (type)
#

class Account::Repository < Account
  belongs_to :tracker,
    class_name: 'Tracker',
    foreign_key: :item_id

  def self.liability(date_range=nil)
    date_range ||= Transaction.order('created_at asc').first.created_at..Transaction.order('created_at desc').first.created_at
    Split.joins(:account).where(created_at: date_range).where('accounts.type = ?', name).sum('splits.amount')
  end
end
