collection @takedowns

attribute :id
attribute :created_at
node(:target) { |obj| obj.linked_account.login }
