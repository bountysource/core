# == Schema Information
#
# Table name: linked_accounts
#
#  id               :integer          not null, primary key
#  person_id        :integer
#  type             :string(255)
#  uid              :bigint(8)
#  login            :string(255)
#  first_name       :string(255)
#  last_name        :string(255)
#  email            :string(255)
#  oauth_token      :string(255)
#  oauth_secret     :string(255)
#  permissions      :string(255)
#  synced_at        :datetime
#  sync_in_progress :boolean          default(FALSE)
#  followers        :integer          default(0)
#  following        :integer          default(0)
#  created_at       :datetime
#  updated_at       :datetime
#  account_balance  :decimal(10, 2)   default(0.0)
#  anonymous        :boolean          default(FALSE), not null
#  company          :string(255)
#  location         :string(255)
#  bio              :text
#  cloudinary_id    :string(255)
#  deleted_at       :datetime
#  remote_id        :string
#
# Indexes
#
#  index_linked_accounts_on_anonymous     (anonymous)
#  index_linked_accounts_on_email         (email) WHERE (email IS NOT NULL)
#  index_linked_accounts_on_login         (login)
#  index_linked_accounts_on_person_id     (person_id)
#  index_linked_accounts_on_uid           (uid)
#  index_linked_accounts_on_uid_and_type  (uid,type) UNIQUE
#

class LinkedAccount::Gitlab < LinkedAccount::Base

  def self.find_or_create_from_api_response(api_response)
    api_response = api_response.with_indifferent_access
    remote_id = api_response[:remote_id]
    if (remote_id && linked_account = find_by(remote_id: api_response[:remote_id]))
      linked_account.update_attributes(
        image_url: api_response[:author_image_url], 
        login: api_response[:author_name])
      linked_account
    else
      create(
        login: api_response[:author_name],
        image_url: api_response[:author_image_url],
        remote_id: api_response[:remote_id]
      )
    end
  end

end
