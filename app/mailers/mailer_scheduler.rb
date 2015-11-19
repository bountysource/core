class MailerScheduler

  def self.remind_unresponsive_backers(days_left)

    bounty_claims = MailerScheduler.find_timely_claims(days_left)
    
    if bounty_claims.length == 0 #if there are no bounty claims going to auto-payout, leave this method.
      Rails.logger.info("No bounty claims closing in #{days_left} day(s).")  
      return
    end

    time_period = days_left > 1 ? "7 days" : "Less than 24 hours"
    
    bounty_claims.each do |bounty_claim|
      unresponsive_backers = bounty_claim.unresponsive_backers
      unresponsive_backers.each do |backer|
        backer.send_email(:remind_unresponsive_backers_of_bounty_claim, time_period: time_period, bounty_claim: bounty_claim)
      end
    end
  end

  def self.find_timely_claims(days_left)
    dispute_period = Api::Application.config.dispute_period_length #currently 2 weeks (14 days)
    #get time-relevant bounty claims. For ex: 14 days - 7 days = 7 days... So find bounty claims created 7 days ago (meaning it has 7 days of dispute period left)
    #includes issue/bounty_claim response because bounty_claim#unresponsive_backers queries those associations
    BountyClaim.includes(:issue, :bounty_claim_responses).where(disputed: false, collected: [false, nil], created_at: (dispute_period - days_left.days).ago.beginning_of_day..(dispute_period - days_left.days).ago.end_of_day)
  end

end
