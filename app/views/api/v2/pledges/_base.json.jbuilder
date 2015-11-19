json.(item,
  :id,
  :amount,
  :created_at)

# This is gross.. TODO pull into partial or something
if @include_owner
  if item.owner.present? && can?(:see_owner, item)
    json.owner do
      json.partial! 'api/v2/owners/base', item: item.owner
    end
  else
    json.owner nil
  end
end
