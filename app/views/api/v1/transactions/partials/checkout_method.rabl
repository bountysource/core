child(:checkout_method => :checkout_method) do
  attribute :id
  attribute :display_name
  node(:type) { root_object.class.name }
  child({:owner => :owner}, { unless: lambda { |r| root_object.class.name == 'Account::PaymentMethod' }} ) do
    extends "api/v1/owners/partials/base"
  end
end
