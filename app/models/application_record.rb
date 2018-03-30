class ApplicationRecord < ActiveRecord::Base
  include HasAccount, HasCloudinary, HasOwner
  self.abstract_class = true
end
