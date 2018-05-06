relation = root_object.relation_for_owner(@profile_person)
if relation && (relation.developer? || relation.admin?)
  attribute :account_balance
end