object @account

attribute :id
attribute :type
attribute :balance
attribute :currency
attribute :name
attribute :created_at
attribute :updated_at
attribute :owner_id
attribute :owner_type

child(:admin_splits => :splits) do
  attributes :id, :amount, :created_at, :updated_at, :account_id, :item_id, :item_type

  child(:txn => :transaction) do
    attribute :id
    attribute :type
    attribute :number
    attribute :description
    attribute :type
    attribute :created_at
    attribute :updated_at
    attribute :gross
    attribute :fee
    attribute :processing_fee
    attribute :liability
    attribute :audited
  end
end

child(:owner => :owner) do
  extends "api/v1/owners/partials/base"
end
