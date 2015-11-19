class Api::V2::TimelineController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::TimelineHelper

  def index
    @collection = []
    events = {}
    newest_first = false
    values = calculate_pagination_offset(params)

    # common methods that don't get executed unless they're added to the collection
    base_bounty_created = Bounty.not_refunded.includes(:owner, :person, :issue => [{:tracker => :team}, :request_for_proposal]).order('created_at desc').limit(values[:per_page])
    base_solution_started = SolutionEvent::Started.includes(:solution => [{ :issue => [{:tracker => :team}, :request_for_proposal] }, :person]).order('solution_events.created_at desc').limit(values[:per_page])
    base_bounty_claimed = BountyClaim.includes(:person, { :issue => [{:tracker => :team}, :request_for_proposal] }).order('created_at desc').limit(values[:per_page])
    base_bounty_collected = BountyClaimEvent::Collected.includes(:bounty_claim => [:person, { :issue => [{:tracker => :team}, :request_for_proposal] }]).order('created_at desc').limit(values[:per_page])
    base_issue_created = Issue.not_deleted.includes({:tracker => :team}, :author => :person).order('created_at desc').limit(values[:per_page])
    base_pledge_created = Pledge.includes(:owner, :person, :fundraiser => :team).order('created_at desc').limit(values[:per_page])
    base_team_payin_created = TeamPayin.not_refunded.includes(:owner, :person, :team).order('created_at desc').limit(values[:per_page])
    base_support_level_created = SupportLevel.active.includes(:owner, :team).order('created_at desc').limit(values[:per_page])

    # show featured bounties on homepage
    if params[:include_featured_bounties]
      base_featured_bounty_created = Bounty.not_refunded.includes(:owner, :person, :issue => [{:tracker => :team}, :request_for_proposal]).order('created_at desc').where('bounties.featured=?', true).limit(values[:per_page])
      base_bounty_created = base_bounty_created.where('bounties.featured=?', false)
      @include_featured_bounties = true
      @collection += collection_to_timeline_hash(:bounty_created, base_featured_bounty_created)
    end

    # team
    if params[:team_id]
      team = Team.where(id: params[:team_id]).first!
      team_ids = [team.id] + team.parent_team_activity_inclusions_teams.pluck(:id)
      team_tracker_ids = Tracker.where(team_id: team_ids).pluck(:id)
      team_bountied_issue_ids = Bounty.not_refunded.where('owner_id in (?) and owner_type=?', team_ids, 'Team').pluck(:issue_id)
      team_fundraiser_ids = Fundraiser.published.where('team_id in (?)', team_ids).pluck(:id)

      # bounties created by team, or created on trackers owned by team
      events[:bounty_created] = base_bounty_created.joins(:issue).where('(owner_id in (?) and owner_type=?) or tracker_id in (?)', team_ids, 'Team', team_tracker_ids)

      # solutions or bounties on trackers owned by team
      events[:solution_started] = base_solution_started.joins(:solution => :issue).where('tracker_id in (?) or issue_id in (?)', team_tracker_ids, team_bountied_issue_ids)
      events[:bounty_claimed] = base_bounty_claimed.joins(:issue).where('tracker_id in (?) or issue_id in (?)', team_tracker_ids, team_bountied_issue_ids)
      events[:bounty_collected] = base_bounty_collected.joins(:bounty_claim => :issue).where('tracker_id in (?) or issue_id in (?)', team_tracker_ids, team_bountied_issue_ids)

      events[:pledge_created] = base_pledge_created.where("fundraiser_id in (?) or (owner_type='Team' and owner_id in (?))", team_fundraiser_ids, team_ids)
      events[:team_payin_created] = base_team_payin_created.where("team_id in (?) or (owner_type='Team' and owner_id in (?))", team_ids, team_ids)
      events[:support_level_created] = base_support_level_created.where("team_id in (?)", team_ids)

    # issue
    elsif params[:issue_id]
      newest_first = true

      issue = Issue.where(id: params[:issue_id]).includes({:tracker => :team}, :author => :person).first!
      events[:bounty_created] = base_bounty_created.where('issue_id=?', issue.id)
      events[:solution_started] = base_solution_started.joins(:solution => :issue).where('issue_id=?', issue.id)
      events[:bounty_claimed] = base_bounty_claimed.where('issue_id=?', issue.id)
      events[:bounty_collected] = base_bounty_collected.joins(:bounty_claim => :issue).where('issue_id=?', issue.id)
      events[:issue_created] = [issue]
      events[:issue_comment_created] = issue.comments.includes(:issue, :author => :person).limit(values[:per_page])

      @include_issue_body = true
      @include_comment_body = true
      @disclude_tracker = true
      @disclude_team = true
      @disclude_issue = true


    # person
    elsif params[:person_id]
      person = Person.where(id: params[:person_id]).first!
      events[:bounty_created] = base_bounty_created.visible.where("(owner_type='Person' and owner_id=?) or (owner_type is null and person_id=?)", person.id, person.id)
      events[:solution_started] = base_solution_started.joins(:solution => :issue).where('person_id=?', person.id)
      events[:bounty_claimed] = base_bounty_claimed.where('person_id=?', person.id)
      events[:bounty_collected] = base_bounty_collected.joins(:bounty_claim => :issue).where('bounty_claims.person_id=?', person.id)
      events[:issue_created] = base_issue_created.where("author_linked_account_id in (?)", person.linked_accounts.pluck(:id))
      events[:issue_comment_created] = Comment.where("author_linked_account_id in (?)", person.linked_accounts.pluck(:id)).includes(:issue, :author => :person).limit(values[:per_page])
      events[:team_payin_created] = base_team_payin_created.where("(owner_type='Person' and owner_id=?) or (owner_type is null and person_id=?)", person.id, person.id)
      events[:pledge_created] = base_pledge_created.visible.where("(owner_type='Team' and owner_id=?) or (owner_type is null and person_id=?)", person.id, person.id)

      @include_issue_body = false
      @include_comment_body = false

    else
      events[:bounty_created] = base_bounty_created
      events[:solution_started] = base_solution_started
      events[:bounty_claimed] = base_bounty_claimed
      events[:bounty_collected] = base_bounty_collected
      events[:pledge_created] = base_pledge_created
      events[:team_payin_created] = base_team_payin_created
      events[:support_level_created] = base_support_level_created
    end

    if params[:salt_only]
      events[:bounty_created] = []
      events[:solution_started] = []
      events[:bounty_claimed] = []
      events[:bounty_collected] = []
    end

    if params[:bounties_only]
      events[:pledge_created] = []
      events[:team_payin_created] = []
      events[:support_level_created] = []
    end


    # turn a bunch of queries into a hash optimized for timeline
    event_hashes = events.map { |key, values| collection_to_timeline_hash(key, values) }.flatten
    event_hashes = event_hashes.compact.reject { |c| c[:timestamp].nil? }.sort_by { |c| c[:timestamp] }
    event_hashes = event_hashes.reverse unless newest_first
    @collection += event_hashes

    # paginate
    @collection = @collection.slice(values[:offset], values[:per_page])
  end

protected

  def collection_to_timeline_hash(key, values)
    values.map do |obj|
      case key
        when :bounty_created
          {
            event: 'bounty_created',
            timestamp: obj.created_at,
            actor: obj.owner,
            bounty: obj,
            issue: obj.issue,
            tracker: obj.issue.tracker,
            team: obj.issue.tracker.team
          }

        when :solution_started
          next if obj.solution.nil?
          {
            event: 'solution_started',
            timestamp: obj.created_at,
            solution: obj.solution,
            actor: obj.solution.person,
            issue: obj.solution.issue,
            tracker: obj.solution.issue.tracker,
            team: obj.solution.issue.tracker.team
          }

        when :bounty_claimed
          {
            event: 'bounty_claimed',
            timestamp: obj.created_at,
            actor: obj.person,
            issue: obj.issue,
            tracker: obj.issue.tracker,
            team: obj.issue.tracker.team,
            bounty_claim: obj
          }

        when :bounty_collected
          {
            event: 'bounty_collected',
            timestamp: obj.created_at,
            actor: obj.bounty_claim.person,
            issue: obj.bounty_claim.issue,
            tracker: obj.bounty_claim.issue.tracker,
            team: obj.bounty_claim.issue.tracker.team,
            bounty_claim: obj.bounty_claim
          }

        when :pledge_created
          {
            event: 'pledge_created',
            timestamp: obj.created_at,
            actor: obj.owner,
            pledge: obj,
            fundraiser: obj.fundraiser,
            team: obj.fundraiser.team
          }

        when :team_payin_created
          {
            event: 'team_payin_created',
            timestamp: obj.created_at,
            actor: obj.owner,
            team_payin: obj,
            team: obj.team
          }

        when :issue_created
          {
            event: 'issue_created',
            timestamp: obj.remote_created_at || obj.created_at,
            actor: obj.author_or_dummy_author,
            tracker: obj.tracker,
            team: obj.tracker.team,
            issue: obj,
            body_html: @include_issue_body ? obj.sanitized_body_html : nil,
            show_issue_title: @show_issue_title
          }

        when :issue_comment_created
          {
            event: 'issue_comment_created',
            timestamp: obj.created_at,
            actor: obj.author_or_dummy_author,
            tracker: obj.issue.tracker,
            team: obj.issue.tracker.team,
            issue: obj.issue,
            comment: obj,
            body_html: @include_comment_body ? obj.sanitized_body_html : nil,
            show_issue_title: @show_issue_title
          }

        when :support_level_created
          {
            event: 'support_level_created',
            support_level: obj,
            timestamp: obj.created_at,
            actor: obj.owner,
            team: obj.team
          }

      end
    end
  end

end
