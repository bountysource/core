# == Schema Information
#
# Table name: admin_stats
#
#  id         :integer          not null, primary key
#  raw_json   :text             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class AdminStat < ApplicationRecord
  def self.update_singleton
    singleton.update_raw_json
  end

  def self.singleton
    unless stat = AdminStat.first
      stat = AdminStat.new
      stat.update_raw_json
    end
    return stat
  end

  def all
    JSON.parse(raw_json)
  end

  def update_raw_json
    update_attributes!(raw_json: compute_stats.to_json)
  end

  def compute_stats
    time_periods = {}

    # day and week in PST
    Time.use_zone('America/Los_Angeles') do
      time_periods.merge!({
        # days
        day_0:    [0.days.ago.beginning_of_day, 0.days.ago.end_of_day],
        day_1:    [1.days.ago.beginning_of_day, 1.day.ago.end_of_day],
        day_2:    [2.days.ago.beginning_of_day, 2.days.ago.end_of_day],
        day_3:    [3.days.ago.beginning_of_day, 3.days.ago.end_of_day],
        day_4:    [4.days.ago.beginning_of_day, 4.days.ago.end_of_day],
        day_5:    [5.days.ago.beginning_of_day, 5.days.ago.end_of_day],
        day_6:    [6.days.ago.beginning_of_day, 6.days.ago.end_of_day],

        # weeks
        week_0:   [0.days.ago.beginning_of_week,  0.days.ago.end_of_week],
        week_1:   [1.week.ago.beginning_of_week,  1.week.ago.end_of_week],
        week_2:   [2.weeks.ago.beginning_of_week, 2.weeks.ago.end_of_week],
        week_3:   [3.weeks.ago.beginning_of_week, 3.weeks.ago.end_of_week],
        week_4:   [4.weeks.ago.beginning_of_week, 4.weeks.ago.end_of_week],
        week_5:   [5.weeks.ago.beginning_of_week, 5.weeks.ago.end_of_week],
        week_6:   [6.weeks.ago.beginning_of_week, 6.weeks.ago.end_of_week],
        week_7:   [7.weeks.ago.beginning_of_week, 7.weeks.ago.end_of_week],
        week_8:   [8.weeks.ago.beginning_of_week, 8.weeks.ago.end_of_week],
        week_9:   [9.weeks.ago.beginning_of_week, 9.weeks.ago.end_of_week],
        week_10:  [10.weeks.ago.beginning_of_week, 10.weeks.ago.end_of_week],
        week_11:  [11.weeks.ago.beginning_of_week, 11.weeks.ago.end_of_week],
        week_12:  [12.weeks.ago.beginning_of_week, 12.weeks.ago.end_of_week],
        week_13:  [13.weeks.ago.beginning_of_week, 13.weeks.ago.end_of_week],

        # trends
        day_trend:    [1.days.ago,  0.days.ago],
        week_trend:   [1.week.ago,  0.weeks.ago]
      })
    end

    # month in UTC
    Time.use_zone('UTC') do
      time_periods.merge!({
        # months
        month_0:  [0.month.ago.beginning_of_month, 0.month.ago.end_of_month],
        month_1:  [1.month.ago.beginning_of_month, 1.month.ago.end_of_month],
        month_2:  [2.month.ago.beginning_of_month, 2.month.ago.end_of_month],
        month_3:  [3.month.ago.beginning_of_month, 3.month.ago.end_of_month],
        month_4:  [4.month.ago.beginning_of_month, 4.month.ago.end_of_month],
        month_5:  [5.month.ago.beginning_of_month, 5.month.ago.end_of_month],
        month_6:  [6.month.ago.beginning_of_month, 6.month.ago.end_of_month],
        month_7:  [7.month.ago.beginning_of_month, 7.month.ago.end_of_month],
        month_8:  [8.month.ago.beginning_of_month, 8.month.ago.end_of_month],
        month_9:  [9.month.ago.beginning_of_month, 9.month.ago.end_of_month],
        month_10:  [10.month.ago.beginning_of_month, 10.month.ago.end_of_month],
        month_11:  [11.month.ago.beginning_of_month, 11.month.ago.end_of_month],
        month_12:  [12.month.ago.beginning_of_month, 12.month.ago.end_of_month],

        # trends
        month_trend:  [1.month.ago, 0.months.ago]
      })
    end

    time_periods.inject({}) do |hash, (name, (start,finish))|
      date_range = start..finish

      hash[name] = {}

      # Earning Users
      users = ApplicationRecord.connection.select_all('select person_id as user_id, sum(amount) as amount, created_at from bounty_claims group by person_id, created_at').to_a
      users += ApplicationRecord.connection.select_all('select COALESCE(fundraisers.team_id, fundraisers.person_id) as user_id, sum(amount) as amount, pledges.created_at from pledges inner join fundraisers on fundraisers.id = pledges.fundraiser_id group by user_id, pledges.created_at').to_a
      users = users.select do |user|
        created_at = DateTime.parse(user['created_at'])
        created_at >= start && created_at <= finish
      end
      earning_users_count = users.uniq { |user| user['user_id'] }.count
      hash[name]['earning_users_count'] = earning_users_count
      hash[name]['avg_payment_per_earning_user'] = users.sum { |user| user['amount'].to_f } / earning_users_count rescue 0

      # Paying Users
      select_query = %w(person_id amount created_at).join(', ')
      pledges = ::Pledge.not_refunded.select(select_query)
      bounties = ::Bounty.not_refunded.select(select_query)
      team_payins = ::TeamPayin.not_refunded.where('amount > ?', 0).select(select_query)
      users = ApplicationRecord.connection.select_all "SELECT person_id, created_at, amount FROM ( #{pledges.to_sql} UNION #{bounties.to_sql} UNION #{team_payins.to_sql} ) AS t"
      users = users.select do |user|
        created_at = DateTime.parse(user['created_at'])
        created_at >= start && created_at <= finish
      end
      user_count = users.uniq { |user| user['person_id'] }.count
      hash[name]['paying_users_count'] = user_count
      hash[name]['avg_revenue_per_paying_user'] = users.sum { |user| user['amount'].to_f } / user_count rescue 0

      # Bounties Paid out
      hash[name]["dev_earnings_bounty_sum"] = Split.joins(:txn).
        where("transactions.type = 'Transaction::InternalTransfer::BountyClaim'").
        where("splits.created_at>=? AND splits.created_at<=?", start, finish).
        where("splits.amount > 0").
        sum("splits.amount")


      # Pledges Paid out
      hash[name]["dev_earnings_pledge_sum"] = Split.joins(:txn, :account).
        where("transactions.type = 'Transaction::InternalTransfer::FundraiserCashOut'").
        where("splits.amount>0").
        where("splits.created_at>=? AND splits.created_at<=?", start, finish).
          sum("splits.amount")


      [Bounty, Pledge].each do |klass|
        key = klass.name.underscore.gsub('/','_')
        rows = klass.where(created_at: date_range)
        amounts = rows.pluck(:amount)

        hash[name]["#{key}_cnt"] = rows.count
        hash[name]["#{key}_sum"] = amounts.sum
        hash[name]["#{key}_avg"] = amounts.reduce(:+).to_f / amounts.size
      end

      hash[name]["bounty_claims"] = BountyClaim.where(created_at: date_range).count

      [Person, Solution].each do |klass|
        key = klass.name.underscore.gsub('/','_')
        hash[name]["#{key}_cnt"] = klass.where(created_at: date_range).count
      end

      # Team Payin from non team-member
      hash[name]["team_donation_sum"] = TeamPayin.not_refunded.where("person_id NOT IN (?) AND created_at BETWEEN ? AND ?", TeamMemberRelation.select('person_id')
        .where('team_payins.team_id = team_member_relations.team_id'), start, finish)
        .sum(:amount)

      #Team Payin from team_member
      hash[name]["fund_team_account_sum"] = TeamPayin.not_refunded.where("person_id IN (?) AND created_at BETWEEN ? AND ?", TeamMemberRelation.select('person_id')
        .where('team_payins.team_id = team_member_relations.team_id'), start, finish)
        .sum(:amount)

      # Cash Outs
      hash[name]["cash_outs_sum"] = CashOut.where("sent_at is NOT NULL AND created_at BETWEEN ? AND ?", start, finish).sum(:amount)

      # Gross Sales
      hash[name]["gross_sales_sum"] = Split.joins(:txn).where("transactions.type IN (?)", ["Transaction::Order::Coinbase", "Transaction::Order::GoogleWallet", "Transaction::Order::Paypal"]).where("splits.created_at>=? AND splits.created_at<=?", start, finish).where("splits.amount > 0").sum("splits.amount")

      hash[name]["fundraiser_created_cnt"] = Fundraiser.where(created_at: date_range).count
      hash[name]["fundraiser_published_cnt"] = Fundraiser.where(published_at: date_range).count
      hash[name]["fundraiser_ended_cnt"] = Fundraiser.where(ends_at: date_range).count
      hash[name]["fundraiser_breached_cnt"] = Fundraiser.where(breached_at: date_range).count

      # GitHub Plugins!

      hash[name]["plugin_install_cnt"] = TrackerPlugin.where(created_at: date_range).count
      hash[name]["plugin_install_unique_people_cnt"] = Person.joins(:tracker_plugins).where("tracker_plugins.created_at>? and tracker_plugins.created_at<=?", start, finish).select('distinct people.id').count

      # Person last seen at
      hash[name]["person_last_seen_at_cnt"] = Person.where(last_seen_at: date_range).count

      # Active Users count
      hash[name]["active_users"] = AccessToken.where(created_at: date_range).select('distinct person_id').count

      #Returning Users Count
      hash[name]["returning_users"] = hash[name]["active_users"] - hash[name]["person_cnt"]

      # Active Teams
      hash[name]["active_team_cnt"] = TeamMemberRelation.where("person_id in (?)", AccessToken.where(created_at: date_range).select('distinct person_id'))
      .pluck(:team_id).uniq.count

      # Team Creates
      hash[name]["team_cnt"] = Team.where(created_at: date_range).count
      hash[name]["team_member_cnt"] = TeamMemberRelation.where(created_at: date_range).count
      hash[name]["team_tracker_cnt"] = TeamTrackerRelation.where(created_at: date_range).count

      # Linked accounts
      LinkedAccount::Base.select('distinct type').map { |row| row.type.constantize }.each do |klass|
        key = klass.name.underscore.gsub('/','_')
        hash[name]["#{key}_cnt"] = klass.where(created_at: date_range).count
      end


      bank_accounts = %w(
        Account::Amazon
        Account::BofA
        Account::BountySourceAdjustment
        Account::BountySourceFeesBounty
        Account::BountySourceFeesPayment
        Account::BountySourceFeesPledge
        Account::BountySourceFeesTeam
        Account::BountySourceMerch
        Account::GoogleWallet
        Account::Liability
        Account::Paypal
      )

      liability_accounts = %w(
        Account::CashOutHold
        Account::DoctorsWithoutBorders
        Account::ElectronicFrontierFoundation
        Account::FreeSoftwareFoundation
        Account::Fundraiser
        Account::IssueAccount
        Account::Personal
        Account::Repository
        Account::SoftwarePublicInterest
        Account::Team
      )

      hash[name]["liability_start_sum"] = Split.joins(:txn, :account).where('transactions.created_at <= ?', start).where('accounts.type in (?)', liability_accounts).sum(:amount).to_f
      hash[name]["liability_finish_sum"] = Split.joins(:txn, :account).where('transactions.created_at <= ?', finish).where('accounts.type in (?)', liability_accounts).sum(:amount).to_f
      hash[name]["liability_diff_sum"] = Split.joins(:txn, :account).where('transactions.created_at' => date_range).where('accounts.type in (?)', liability_accounts).sum(:amount).to_f

      hash
    end

    ## current 24 hours, previous 24 hours, 7 days, 30 days, previous 30 days,
    #
    #master_hash = {}
    #
    #Person.select('count(*) as the_count, substring(created_at,1,7) as the_month').group("substring(created_at,1,7)").map(&:attributes).each do |row|
    #  master_hash[row['the_month']] ||= {}
    #  master_hash[row['the_month']]['people_count'] = row['the_count']
    #end
    #
    #Bounty.select('count(*) as the_count, sum(amount) as the_sum, avg(amount) as the_avg, substring(created_at,1,7) as the_month').group("substring(created_at,1,7)").map(&:attributes).each do |row|
    #  master_hash[row['the_month']] ||= {}
    #  master_hash[row['the_month']]['bounty_count'] = row['the_count']
    #  master_hash[row['the_month']]['bounty_sum'] = row['the_sum'].to_f
    #  master_hash[row['the_month']]['bounty_avg'] = row['the_avg'].to_f
    #end
    #
    #master_hash
  end
end





# USED TO GENERATE "Salt Revenue" GRAPH
# range = Time.parse('2015-08-02 00:00:00')..Time.parse('2015-09-02 00:00:00')
# SupportLevelPayment.not_refunded.where(created_at: range).count
# SupportLevelPayment.not_refunded.where(created_at: range).sum(:amount).to_f
#
#
#
# SupportLevel.where(status: 'active').where(last_invoice_ends_at: '2015-07-31').where(team_id: team_ids).count
# SupportLevel.where(status: 'active').where(last_invoice_ends_at: '2015-07-31').where(team_id: team_ids).sum(:amount).to_f
#
#
# pp TeamPayin.where(created_at: Time.parse("2015-03-01").beginning_of_month..Time.parse("2015-08-01").end_of_month).where(team_id: team_ids).order('amount desc').limit(10).each { |tp| puts "#{tp.created_at} #{tp.amount} #{tp.team.name} #{tp.person.display_name}" }
#
# team_ids = Team.where(accepts_public_payins:true).pluck(:id)
# ['2015-03-01','2015-04-01', '2015-05-01', '2015-06-01', '2015-07-01', '2015-08-01'].each do |month|
#   range = Time.parse(month).beginning_of_month..Time.parse(month).end_of_month
#
#   puts "\n\n\n\n#{range}"
#   team_payins = TeamPayin.where(team_id: team_ids).where(created_at: range)
#   puts "TeamPayin # #{team_payins.count}"
#   puts "TeamPayin $ #{team_payins.sum(:amount)}"
#
#   pledges = Pledge.joins(:fundraiser).where('fundraisers.team_id' => team_ids).where(created_at: range)
#   puts "Pledge # #{pledges.count}"
#   puts "Pledge $ #{pledges.sum(:amount)}"
#
#   support_levels = SupportLevelPayment.where(period_starts_at: range).joins(:support_level).where('support_levels.team_id' => team_ids).not_refunded
#
#   new_support_levels = support_levels.where("support_level_payments.id in (select min(id) from support_level_payments as slp where slp.support_level_id=support_level_payments.support_level_id)")
#   puts "New SupportLevel # #{new_support_levels.count}"
#   puts "New SupportLevel $ #{new_support_levels.sum(:amount)}"
#
#   recurring_support_levels = support_levels.where.not("support_level_payments.id in (select min(id) from support_level_payments as slp where slp.support_level_id=support_level_payments.support_level_id)")
#   puts "Recurring SupportLevel # #{recurring_support_levels.count}"
#   puts "Recurring SupportLevel $ #{recurring_support_levels.sum(:amount)}"
# end
