json.(item, *%i(
id
amount
fee
fee_adjustment
paypal_address
bitcoin_address
ripple_address
mastercoin_address
sent_at
is_refund
us_citizen
created_at
updated_at
approved_at
batch_id
))

json.type item.type_name

# If admin, expose remote_ip and user_agent
if defined?(current_user) && current_user.try(:admin?)
  json.(item, :remote_ip, :user_agent)
end

if @include_person
  json.person { json.partial!('api/v2/people/base', item: item.person) }
else
  json.(item, :person_id)
end

if @include_account_owner
  json.account_owner { json.partial!('api/v2/owners/base', item: item.account.owner) }
end

if @include_address
  json.address { json.partial!('api/v2/addresses/base', item: item.address) }
else
  json.(item, :address_id)
end

if @include_mailing_address
  if item.mailing_address.present?
    json.mailing_address do
      json.partial! 'api/v2/addresses/base', item: item.mailing_address
    end
  else
    json.mailing_address nil
  end
else
  json.(item, :mailing_address_id)
end


if @include_yearly_cash_out_totals
  json.yearly_cash_out_totals item.person.yearly_cash_out_totals
end
