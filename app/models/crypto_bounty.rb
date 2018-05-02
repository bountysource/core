class CryptoBounty < ApplicationRecord
  belongs_to :issue
  belongs_to :owner
end
