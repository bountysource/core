# == Schema Information
#
# Table name: searches
#
#  id         :integer          not null, primary key
#  query      :string           not null
#  person_id  :integer
#  created_at :datetime         not null
#  params     :text             default({})
#

class Search < ApplicationRecord
  serialize :params

  # RELATIONSHIPS
  belongs_to :person

  # INSTANCE METHODS
  def results
    json = begin
      if query =~ /^https?:\/\//
        if !(object = Tracker.magically_turn_url_into_tracker_or_issue(query))
          {} # URL not matched, render no results
        elsif object.is_a?(Issue)
          { async?: false, issue: object }
        elsif object.is_a?(Tracker)
          # If we just created this Tracker model, it requires a remote_sync. We cannot confidently perform this
          # synchronously, because it may take a long time if the Tracker has a lot of issues, so return a Delayed::Job
          # id for polling.
          if object.respond_to?(:magically_created?) && object.magically_created?
            job = object.delay.remote_sync(force: true, state: "open")
            { async?: true, job_id: job.id, tracker: object }
          else
            { async?: false, tracker: object }
          end
        else
          raise "This should never happen!"
        end
      else
        local_trackers_and_issues
        # TODO: add github repo search
      end
    end
    OpenStruct.new(json)
  end

  def self.tracker_typeahead(query)
    tracker_search = Tracker.search(query, fields: [:name], order: {bounty_total: :desc}, match: :word_start, limit: 5, boost_by: [:forks, :watchers]).to_a
    reject_merged_trackers!(tracker_search)
  end

  def self.bounty_search(params)
    create(query: "bounty search", params: params)

    page = params[:page] || 1
    per_page = params[:per_page].to_i || 50
    query = params[:search] || "*"
    min = params[:min].present? ? params[:min].to_f : 1.0
    max = params[:max].present? ? params[:max].to_f : 10_000.0
    order = ["bounty_total", "backers_count", "earliest_bounty", "participants_count", "thumbs_up_count", "remote_created_at"].include?(params[:order]) ? params[:order] : "bounty_total"
    direction = ['asc', 'desc'].include?(params[:direction]) ? params[:direction] : 'asc'
    languages = params[:languages].present? ? params[:languages].split(',').map(&:to_i) : []
    trackers = params[:trackers].present? ? params[:trackers].split(',').map(&:to_i) : []
    can_add_bounty = params[:can_add_bounty] == "all" ? [] : true
    #build a "with" hash for the filtering options. order hash for sorting options.
    with_hash = {
      tracker_id: trackers,
      language_id: languages,
      can_add_bounty: can_add_bounty,
      bounty_total: { gte: min, lte: max },
      paid_out: false
    }.select {|param, value| value.present?}

    #if an order is specified, build the order query. otherwise, pass along an empty string to order
    if order
      order_hash = {order => direction}
    else
      order_hash = nil
    end
    
    bounteous_issue_search = Issue.search(query, where: with_hash, 
      per_page: per_page, page: page, includes: [tracker: :languages],
      fields: ["title^50", "tracker_name^25", "languages_name^5", "body"],
      order: order_hash).to_a


    reject_merged_issues!(bounteous_issue_search)

    {
      issues: bounteous_issue_search,
      issues_total: bounteous_issue_search.count
    }
  end

  def self.team_issue_search(params)
    # # NB: although indexed, owner_type currently does not work
    # #parse params to boolean
    # params[:show_team_issues] = params[:show_team_issues].to_bool
    # params[:show_related_issues] = params[:show_related_issues].to_bool
    # # save search record
    # create(query: "team_issue_search", params: params)

    # # parse datetime parameter
    # date_range = Search.parse_datetime(params[:created_at])
    # activity_range = Search.parse_datetime(params[:last_event_created_at])

    # ## Build with/ without conditions
    # # we only care about issues for the team making the query
    # # only return open issues
    # with_hash = { team_id: params[:owner_id], can_add_bounty: true}
    # without_hash = {}

    # ####### TODO Add team_id to with_hash to restrict results to only the team doing the query. use team_ids column.

    # if params[:show_team_issues] && params[:show_related_issues]
    #   #don't add any conditions to search. will return all issues
    # elsif params[:show_team_issues]
    #   #only show teams issues
    #   with_hash.merge!(owner_id: params[:owner_id])
    # elsif params[:show_related_issues]
    #   #only show related issues
    #   without_hash.merge!(owner_id: params[:owner_id])
    # else
    #   #they didn't want either so return nothing?
    #   return { issues: [], issues_count: 0}
    # end

    # # add date constraints
    # with_hash.merge!(remote_created_at: date_range, last_event_created_at: activity_range).select! { |key, value|  value.present? }

    # #Build ordering conditions
    # order = ["bounty_total", "participants_count", "thumbs_up_count", "remote_created_at", "rank"].include?(params[:order]) ? params[:order] : "rank"
    # direction = ['asc', 'desc'].include?(params[:direction]) ? params[:direction] : 'desc'
    # order_hash = "#{order} #{direction}"

    # search_result = ThinkingSphinx.search(
    #   params[:query],
    #   :indices => ["team_issue_core"],
    #   :page => params[:page] || 1,
    #   :per_page => params[:per_page] || 25,
    #   :sql => { :include => :issue },
    #   :with => with_hash,
    #   :without => without_hash,
    #   :order => order_hash,
    #   :star => true
    # )

    # {
    #   issue_ranks: search_result,
    #   issues_count: search_result.total_entries
    # }
  end

  # Get all of the bounty searches
  def self.bounty
    where("query = 'bounty search'")
  end

  # Get all of the general searches
  def self.general
    where("query != 'bounty search'")
  end

protected

  def self.parse_datetime(date_string)
    parsed_datetime = DateTime.strptime(date_string, "%m/%d/%Y") unless date_string.blank?
    if parsed_datetime.try(:<, DateTime.now)
      date_range = (parsed_datetime..DateTime.now)
    end
    date_range
  end

  def self.reject_merged_trackers!(search_results)
    tracker_ids = MergedModel.where(bad_id: search_results.map(&:id)).pluck(:bad_id)
    search_results.reject! { |tracker| tracker_ids.include?(tracker.id) }
    search_results
  end

  def self.reject_merged_issues!(search_results)
    tracker_ids = MergedModel.where(bad_id: search_results.map(&:id)).pluck(:bad_id)
    search_results.reject! { |issue| tracker_ids.include?(issue.tracker_id) }
    search_results
  end

  def local_trackers_and_issues
    # Filters out Trackers that have been merged.

    tracker_search = Tracker.search(query, 
      fields: [:name], 
      order: {bounty_total: :desc}, 
      match: :word_start, 
      boost_by: [:forks, :watchers],
      limit: 50).to_a
    self.class.reject_merged_trackers!(tracker_search)

    # Filters out Issues whose Trackers have been merged.
    issue_search = Issue.search(query, 
      order: { bounty_total: :desc }, 
      boost_by: {comments_count: {factor: 10}}, 
      fields: ["title^50", "tracker_name^25", "languages_name^5", "body"],
      limit: 50
    ).to_a

    self.class.reject_merged_issues!(issue_search)

    {
      trackers: tracker_search,
      trackers_total: tracker_search.count,
      issues: issue_search,
      issues_total: issue_search.count
    }
  end

end
