json.array! @collection do |subscription|
  json.partial! 'api/v2/bounty_subscriptions/bounty_subscription', subscription: subscription
end
