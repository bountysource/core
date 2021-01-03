# == Schema Information
#
# Table name: linked_accounts
#
#  id               :integer          not null, primary key
#  person_id        :integer
#  type             :string
#  uid              :bigint(8)
#  login            :string
#  first_name       :string
#  last_name        :string
#  email            :string
#  oauth_token      :string
#  oauth_secret     :string
#  permissions      :string
#  synced_at        :datetime
#  sync_in_progress :boolean          default(FALSE)
#  followers        :integer          default(0)
#  following        :integer          default(0)
#  created_at       :datetime
#  updated_at       :datetime
#  account_balance  :decimal(10, 2)   default(0.0)
#  anonymous        :boolean          default(FALSE), not null
#  company          :string
#  location         :string
#  bio              :text
#  cloudinary_id    :string
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

class LinkedAccount::Github::Organization < LinkedAccount::Github

  def self.find_or_create_from_github_response(attrs)
    sanitized_attributes = sanitize_attributes(attrs)
    account = where(uid: sanitized_attributes[:uid]).first
    account ||= create!(sanitized_attributes)
  end

  def self.sanitize_attributes(attrs)
    attrs = attrs.with_indifferent_access
    {
      uid: attrs['id'],
      login: attrs['login'],
      image_url: attrs['avatar_url']
    }
  end

  # THIS DOESN'T WORK BECAUSE THERE'S MORE THAN 100 ORGANIZATIONS CREATED EVERY DAY
  # def self.sync_all_orgs_from_github
  #   retrieved_ids = []
  #   date_cursor = Date.tomorrow
  #   loop do
  #     response = ::Github::API.call(url: "/search/users", params: { q: "type:Organization created:<=#{date_cursor}", per_page: 100, sort: 'created', order: 'desc' })
  #     raise "ERROR: auto paginating #{response.status}" unless response.success?
  #     issues = LinkedAccount::Github.update_attributes_from_github_array(response.data['items'])
  #   end
  # end
end
