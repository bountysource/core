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

FactoryBot.define do

  factory :linked_account_github, class: LinkedAccount::Github::User do
    sequence(:uid) { |n| n }
    sequence(:login) { |n| "johndoe-#{n}" }
    synced_at nil
  end


end
