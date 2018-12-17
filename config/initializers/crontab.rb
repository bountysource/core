Crontab.run do

  if Rails.env.production?
    every 1.hour, 'AdminStat.update_singleton'
    every 1.hour, 'PublicStat.update_singleton'

    # bill for salt
    every 1.hour, 'PaymentMethod.create_and_settle_all_pending_invoices!'

    # reset stats at the beginning of every month.. that's hard so let's just do it every hour
    every 1.hour, 'Team.update_financial_caches_for_active_teams'

    every 1.day, 'MailerScheduler.remind_unresponsive_backers(1)' #24 hour notice

    every 1.day, 'MailerScheduler.remind_unresponsive_backers(7)' #7 day notice

    # TODO: this isn't optimized at all.. 1000s+ calls
    #every 1.hour, 'Tracker.update_ranks'

    every 10.minutes, 'Fundraiser.payout_completed!'

    every 10.minutes, 'BountyClaim.accept_eligible!'

    every 5.minutes, 'Currency.sync_all'

    every 1.day, 'ChargeUserInactivityFee.new.perform'

    # TODO: old. syncs trackers from plugins, but that ain't right, dawg.
    # every 1.hour, 'Tracker.joins(:plugin).where("tracker_plugins.locked = false").each { |tracker| tracker.delay.remote_sync }'
  end

end
