class Api::V1::StatsController < ApplicationController

  before_action require_tracker(:id), only: [:tracker]

  def global
    render json: {
      bounty_total: Tracker.where("bounty_total > 0").sum(:bounty_total),
      collected_total: BountyClaim.where(collected: true).includes(:issue).sum { |claim| claim.issue.bounty_total }
    }, status: :ok
  end

  def tracker
    render json: {
      bounty_total: @tracker.bounty_total,
      collected_total: Issue.where(tracker_id: @tracker.id, paid_out: true).sum(:bounty_total)
    }, status: :ok
  end

end