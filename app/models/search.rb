# == Schema Information
#
# Table name: searches
#
#  id         :integer          not null, primary key
#  query      :string(255)      not null
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
    tracker_search = Tracker.search(query, fields: [:name], order: {_score: :desc, bounty_total: :desc}, match: :word_start, limit: 5, boost_by: [:forks, :watchers]).to_a
    reject_merged_trackers!(tracker_search)
  end

  def self.bounty_search(params)
    page = params[:page] || 1
    per_page = params[:per_page].present? ? params[:per_page].to_i : 50
    query = params[:search] || "*"
    min = params[:min].present? ? params[:min].to_f : 0.01
    max = params[:max].present? ? params[:max].to_f : 1_000_000_000.0
    order = ["bounty_total", "backers_count", "earliest_bounty", "participants_count", "thumbs_up_count", "remote_created_at"].include?(params[:order]) ? params[:order] : "bounty_total"
    direction = ['asc', 'desc'].include?(params[:direction]) ? params[:direction] : 'desc'
    languages = params[:languages].present? ? params[:languages].split(',') : []
    trackers = params[:trackers].present? ? params[:trackers].split(',') : []
    category = params[:category] || []
    #build a "with" hash for the filtering options. order hash for sorting options.
    with_hash = {
      tracker_name: trackers,
      languages_name: languages,
      can_add_bounty: true,
      category: category,
      _or: [{bounty_total: { gte: min, lte: max }}]
    }.select {|param, value| value.present?}

    #if an order is specified, build the order query. otherwise, pass along an empty string to order
    if order
      order_hash = {order => direction}
    else
      order_hash = nil
    end
    
    bounteous_issue_search = Issue.search(query, where: with_hash, 
      per_page: per_page, page: page, includes: [:issue_address, author: [:person], tracker: [:languages, :team]],
      fields: ["title^50", "tracker_name^25", "languages_name^5", "body"],
      order: order_hash)

    reject_merged_issues!(bounteous_issue_search.to_a)

    {
      issues: bounteous_issue_search,
      issues_total: bounteous_issue_search.total_count
    }
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
