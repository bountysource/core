# == Schema Information
#
# Table name: wallets
#
#  id         :bigint(8)        not null, primary key
#  person_id  :integer          not null
#  label      :string
#  eth_addr   :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  verified   :boolean          default(FALSE)
#  primary    :boolean          default(FALSE)
#
# Indexes
#
#  index_wallets_on_person_id  (person_id)
#

class Wallet < ApplicationRecord
  belongs_to :person
  validates :person_id, presence: true
  validates :eth_addr, presence: true, uniqueness: true

  before_save :set_first_as_primary


  private
    def set_first_as_primary
      if person.wallets.count == 0
        self.primary = true
      end
    end
end
