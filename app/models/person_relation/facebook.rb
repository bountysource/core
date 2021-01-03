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

class PersonRelation::Facebook < PersonRelation::Base
  # get list of friend IDs from facebook, then automatically
  # create relations between @person and all linked accounts found
  # from friends with bountysource accounts + linked FB account
  def self.find_or_create_friends(person)
    return [] unless person.facebook_account

    # collect IDs of your friends from graph API
    friend_ids = person.facebook_account.friends.map { |d| d['id'] }

    # Person models found by check UIDs of friends returned by graph API.
    friends_found = Person.joins(:facebook_account).where('linked_accounts.uid in (:uids)', uids: friend_ids)

    # only create new friendships
    new_relations = (friends_found - person.friends).map do |friend|
      create type: name, person: person, target_person: friend
    end

    # return list of the new friends
    new_relations.map(&:target_person)
  end
end
