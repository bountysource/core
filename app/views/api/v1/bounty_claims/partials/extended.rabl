attribute :contested? => :contested
attribute :backers_count
attribute :accept_count
attribute :reject_count

if can? :manage, root_object
  attribute :paid_out
  attribute :updated_at
end
