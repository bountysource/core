namespace :bounty_subscriptions do
  desc "Send daily bounty digest emails to subscribers"
  task digest_daily: :environment do
    BountySubscriptionDigestJob.perform(frequency: 'daily')
  end

  desc "Send weekly bounty digest emails to subscribers"
  task digest_weekly: :environment do
    BountySubscriptionDigestJob.perform(frequency: 'weekly')
  end

  desc "Send instant bounty notifications to subscribers"
  task digest_instant: :environment do
    BountySubscriptionDigestJob.perform(frequency: 'instant')
  end
end
