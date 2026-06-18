class BountySubscriptionDigestJob
  FREQUENCIES = {
    'instant' => 1.hour,
    'daily'   => 24.hours,
    'weekly'  => 7.days
  }.freeze

  def self.perform(frequency: 'daily')
    lookback = FREQUENCIES.fetch(frequency, 24.hours)

    BountySubscription.active.by_frequency(frequency).find_each do |subscription|
      since = subscription.last_checked_at || lookback.ago
      bounties = subscription.matching_bounties(since: since)

      if bounties.any?
        subscription.person.send_email(
          :bounty_subscription_digest,
          subscription: subscription,
          bounties: bounties
        )
      end

      subscription.update!(last_checked_at: Time.current)
    end
  end
end
