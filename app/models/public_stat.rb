# == Schema Information
#
# Table name: public_stats
#
#  id             :integer          not null, primary key
#  daily_json     :text             not null
#  weekly_json    :text             not null
#  monthly_json   :text             not null
#  quarterly_json :text             not null
#  created_at     :datetime
#  updated_at     :datetime
#

# NOTE: copied a bunch from AdminStat

class PublicStat < ActiveRecord::Base

  attr_accessible :daily_json, :weekly_json, :monthly_json, :quarterly_json

  def self.update_singleton(force=false)
    if force || !singleton.is_up_to_date?
      singleton.update_raw_json
    end
  end

  def self.singleton
    unless stat = self.first
      stat = self.new
      stat.update_raw_json
    end
    return stat
  end

  def is_up_to_date?
    Time.use_zone('America/Los_Angeles') do
      return updated_at > 1.day.ago.end_of_day
    end
  end

  def daily
    JSON.parse(daily_json)
  end

  def weekly
    JSON.parse(weekly_json)
  end

  def monthly
    JSON.parse(monthly_json)
  end

  def quarterly
    JSON.parse(quarterly_json)
  end

  def update_raw_json
    time_periods = {}

    Time.use_zone('America/Los_Angeles') do
      time_periods[:daily] = (0..30).map { |day| day.days.ago.beginning_of_day .. day.day.ago.end_of_day }.reverse
    end

    Time.use_zone('America/Los_Angeles') do
      time_periods[:weekly] = (0..26).map { |week| week.weeks.ago.beginning_of_week .. week.weeks.ago.end_of_week }.reverse
    end

    Time.use_zone('UTC') do
      time_periods[:monthly] = (0..48).map { |month| month.months.ago.beginning_of_month .. month.months.ago.end_of_month }.reject { |range| range.first < Date.parse('2013-01-01') }.reverse
    end

    Time.use_zone('UTC') do
      time_periods[:quarterly] = []
      start = Time.parse("2013-01-10").beginning_of_month
      while (start < Date.today)
        time_periods[:quarterly].push(start .. (start+3.months-1.second))
        start += 3.months
      end
    end

    update_attributes!(
      daily_json: compute_stats(time_periods[:daily], "%e %b").to_json,
      weekly_json: compute_stats(time_periods[:weekly], "%e %b").to_json,
      monthly_json: compute_stats(time_periods[:monthly], "%b '%y").to_json,
      quarterly_json: compute_stats(time_periods[:quarterly], "%q %Y").to_json
    )
  end

  def person_ids_active_in_time_period(time_period)
    cache_key = "#{time_period.first.to_i}-#{time_period.last.to_i}"
    @cache = {}
    unless @cache[cache_key]
      @cache[cache_key] = begin
        person_ids = []
        person_ids += AccessToken.select('distinct person_id').where(created_at: time_period).pluck(:person_id)
        person_ids += ActivityLog.select('distinct person_id').where(created_at: time_period).where.not(person_id: nil).pluck(:person_id)
        person_ids += Person.select('id').where(last_seen_at: time_period).pluck(:id)
        person_ids += Person.select('id').where(created_at: time_period).pluck(:id)
        person_ids += TeamMemberRelation.select('distinct person_id').where(created_at: time_period).pluck(:person_id)
        person_ids += MixpanelEvent.select('distinct person_id').where.not(person_id: nil).where.not(event: 'Sent Email').where(created_at: time_period).pluck(:person_id)
        person_ids.uniq
      end
    end

    return @cache[cache_key]
  end

  # shift monthly salt numbers by a day so august 1st is included in july numbers and so on.
  def salt_month_shift(time_period)
    Time.use_zone('UTC') do
      if time_period.first == time_period.first.beginning_of_month && time_period.last == time_period.last.end_of_month
        return (time_period.first + 1.day) .. (time_period.last + 1.day)
      else
        return time_period
      end
    end
  end

  def compute_stats(time_periods, time_format)
    result = {
      labels: time_periods.map(&:first).map { |start| start.strftime(time_format).gsub('%q', "Q#{(start.month-1)/3+1}") },
      series: {
        active_users_cnt: time_periods.map { |tp|
          person_ids_active_in_time_period(tp).count
        },

        new_users_cnt: time_periods.map { |tp|
          Person.where(created_at: tp).count
        },

        active_teams_cnt: time_periods.map { |tp|
          person_ids = person_ids_active_in_time_period(tp)
          TeamMemberRelation.select('distinct team_id').where("created_at < ?", tp.last).where(member: true).where(person_id: person_ids).count
        },

        new_teams_cnt: time_periods.map { |tp|
          start_of_month = TeamMemberRelation.select('distinct team_id').where(member: true).where("created_at < ?", tp.first).count
          end_of_month = TeamMemberRelation.select('distinct team_id').where(member: true).where("created_at <= ?", tp.last).count
          end_of_month - start_of_month
        },

        earned_pledges_sum: time_periods.map { |tp|
          Pledge.joins('left join fundraisers on pledges.fundraiser_id=fundraisers.id').where(created_at: tp).sum(:amount).to_i
        },

        earned_donations_sum: time_periods.map { |tp|
          TeamPayin.not_refunded.where(created_at: tp).sum(:amount).to_i
        },

        bounty_claim_cnt: time_periods.map { |tp|
          BountyClaim.where(created_at: tp).count
        },

        bounty_paid_cnt: time_periods.map { |tp|
          BountyClaimEvent::Collected.where(created_at: tp).count
        },

        earned_bounties_sum: time_periods.map { |tp|
          BountyClaimEvent::Collected.joins(:bounty_claim).where(created_at: tp).sum('bounty_claims.amount').to_i
        },

        earner_developers_cnt: time_periods.map { |tp|
          display_as = []
          display_as += BountyClaimEvent::Collected.joins(:bounty_claim).where(created_at: tp).pluck("'Person'||bounty_claims.person_id")
          display_as.uniq.count
        },

        earner_teams_cnt: time_periods.map { |tp|
          display_as = []
          display_as += TeamPayin.not_refunded.where(created_at: tp).pluck("distinct 'Team'||team_id")
          display_as += Pledge.not_refunded.joins('left join fundraisers on pledges.fundraiser_id=fundraisers.id').where(created_at: tp).pluck("distinct 'Team'||team_id")
          display_as += SupportLevelPayment.not_refunded.joins(:support_level).where(created_at: salt_month_shift(tp)).pluck("distinct 'Team'||support_levels.team_id")
          display_as.uniq.count
        },



        # BLOCKER: exclude team member pays into their own team (funding)
        # BLOCKER: exclude team donating to a team member
        spent_pledges_sum: time_periods.map { |tp|
          Pledge.not_refunded.where(created_at: tp).sum(:amount).to_i
        },
        spent_pledges_cnt: time_periods.map { |tp|
          Pledge.not_refunded.where(created_at: tp).count
        },
        spent_donations_sum: time_periods.map { |tp|
          TeamPayin.not_refunded.not_from_members.where(created_at: tp).sum(:amount).to_i
        },
        spent_donations_cnt: time_periods.map { |tp|
          TeamPayin.not_refunded.not_from_members.where(created_at: tp).count
        },
        spent_bounties_sum: time_periods.map { |tp|
          Bounty.not_refunded.where(created_at: tp).sum(:amount).to_i
        },


        # BLOCKER: exclude team member pays into their own team (funding)
        # BLOCKER: exclude team donating to a team member
        spender_developers_cnt: time_periods.map { |tp|
          display_as = TeamPayin.not_refunded.where(created_at: tp).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as += Pledge.not_refunded.where(created_at: tp).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as += Bounty.not_refunded.where(created_at: tp).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as += SupportLevelPayment.not_refunded.where('support_level_payments.created_at' => salt_month_shift(tp)).joins(:support_level).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as.uniq.select { |d| d['Person'] }.count
        },
        spender_teams_cnt: time_periods.map { |tp|
          display_as = TeamPayin.not_refunded.where(created_at: tp).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as += Pledge.not_refunded.where(created_at: tp).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as += Bounty.not_refunded.where(created_at: tp).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as += SupportLevelPayment.not_refunded.where('support_level_payments.created_at' => salt_month_shift(tp)).joins(:support_level).pluck("coalesce(owner_type, 'Person') || coalesce(owner_id, person_id)")
          display_as.uniq.select { |d| d['Team'] }.count
        },

        support_level_payments_sum: time_periods.map { |tp|
          SupportLevelPayment.not_refunded.where(created_at: salt_month_shift(tp)).sum(:amount).to_i
        },

        support_level_payments_cnt: time_periods.map { |tp|
          SupportLevelPayment.not_refunded.where(created_at: salt_month_shift(tp)).count
        },

        support_level_sum: time_periods.map { |tp|
          SupportLevel.active.where(created_at: salt_month_shift(tp)).sum(:amount).to_i
        },

        support_level_cnt: time_periods.map { |tp|
          SupportLevel.active.where(created_at: salt_month_shift(tp)).count
        },

        bounties_posted_team_sum: time_periods.map { |tp|
          Bounty.not_refunded.where(created_at: tp, owner_type: 'Team').sum(:amount).to_i
        },

        bounties_posted_person_sum: time_periods.map { |tp|
          Bounty.not_refunded.where(created_at: tp).where("owner_type is null or owner_type != 'Team'").sum(:amount).to_i
        },

        bounties_posted_cnt: time_periods.map { |tp|
          Bounty.not_refunded.where(created_at: tp).count
        },

        bounties_awarded_cnt: time_periods.map { |tp|
          issue_ids = BountyClaimEvent::Collected.joins(:bounty_claim).where(created_at: tp).pluck(:issue_id)
          Bounty.not_refunded.where(issue_id: issue_ids).count
        },

        developer_goal_set_cnt: time_periods.map { |tp|
          DeveloperGoal.where(created_at: tp).count
        },

        solution_started_cnt: time_periods.map { |tp|
          SolutionEvent::Started.where(created_at: tp).count
        },

        solution_stopped_cnt: time_periods.map { |tp|
          SolutionEvent::Stopped.where(created_at: tp).count
        },

        issue_suggested_cnt: time_periods.map { |tp|
          IssueSuggestion.where(created_at: tp).count
        },

        issue_thumbs_cnt: time_periods.map { |tp|
          Thumb.up_votes.where(created_at: tp).count
        },

        bounty_hunter_cnt: time_periods.map { |tp|
          TeamBountyHunter.active.where(created_at: tp).count
        },

        team_member_cnt: time_periods.map { |tp|
          TeamMemberRelation.where(created_at: tp).where(member: true).count
        },

      }
    }
  end

end
