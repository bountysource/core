class Api::V2::RecommendationsController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::TimelineHelper

  before_action :require_auth, only: [:index, :create]

  def index
    events = []
    values = calculate_pagination_offset(params)

    # load person and their linked accounts
    person = (params[:person_id] && Rails.env.development?) ? Person.find(params[:person_id]) : current_user
    linked_account_ids = person.linked_accounts.pluck(:id)
    tracker_ids = person.tracker_relations.pluck(:tracker_id)

    # ignore items they've skipped, are in their cart, or they created bounties on already
    ignore_issue_ids = []
    ignore_issue_ids += person.recommendation_events.where(event: 'skip').distinct.pluck(:issue_id)
    ignore_issue_ids += person.shopping_cart.items.map { |item| item['issue_id'] }.compact.map(&:to_i)
    ignore_issue_ids += person.bounties.pluck(:issue_id)
    ignore_issue_ids.uniq!

    # get issue_id from latest comments
    comments = Comment.select('comments.issue_id as issue_id, max(comments.created_at) as max_created_at').where(author_linked_account_id: linked_account_ids, issues: { can_add_bounty: true }).joins(:issue).group('comments.issue_id').includes(:issue => :tracker).order('max(comments.created_at) desc').limit(values[:per_page])
    comments = comments.where("issues.tracker_id not in (?)", tracker_ids) unless tracker_ids.empty?
    comments = comments.where("issues.id not in (?)", ignore_issue_ids) unless ignore_issue_ids.empty?
    comments.each do |comment|
      events.push(
        type: 'comment_created',
        created_at: comment.max_created_at,
        issue: comment.issue,
        tracker: comment.issue.tracker
      )
    end
    ignore_issue_ids += comments.map(&:issue_id)
    ignore_issue_ids.uniq!

    # get issues
    issues = Issue.where(can_add_bounty: true, author_linked_account_id: linked_account_ids).includes(:tracker).order('created_at desc').limit(values[:per_page])
    issues = issues.where("tracker_id not in (?)", tracker_ids) unless tracker_ids.empty?
    issues = issues.where("id not in (?)", ignore_issue_ids) unless ignore_issue_ids.empty?
    issues.each do |issue|
      events.push(
        type: 'issue_created',
        created_at: issue.remote_created_at || issue.created_at,
        issue: issue,
        tracker: issue.tracker
      )
    end

    @collection = events.sort_by { |event| event[:created_at] }.reverse
  end

  def create
    current_user.recommendation_events.create!(event: params[:event], issue_id: params[:recommendation].try(:[], :issue).try(:[], :id))
    render json: true
  end

end
