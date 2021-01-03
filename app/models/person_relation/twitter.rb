# == Schema Information
#
# Table name: person_relations
#
#  id               :integer          not null, primary key
#  type             :string           not null
#  person_id        :integer          not null
#  target_person_id :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_person_relations_on_person_id         (person_id)
#  index_person_relations_on_target_person_id  (target_person_id)
#  index_person_relations_on_type_and_people   (type,person_id,target_person_id) UNIQUE
#

class PersonRelation::Twitter < PersonRelation::Base
  # get list of friend IDs from twitter, then automatically
  # create relations between @person and all linked accounts found
  # from friends with bountysource accounts + linked twitter account
  def self.find_or_create_friends(person)
    return [] unless person.twitter_account && person.twitter_account.oauth_token? && person.twitter_account.oauth_secret?

    # collect IDs of your friends from API
    friend_ids = person.twitter_account.friend_ids

    # Person models found by check UIDs of friends returned by graph API.
    friends_found = Person.joins(:twitter_account).where('linked_accounts.uid in (:uids)', uids: friend_ids)

    # only create new friendships
    new_relations = (friends_found - person.friends).map do |friend|
      create type: name, person: person, target_person: friend
    end

    # return list of the new friends
    new_relations.map(&:target_person)
  end
end
