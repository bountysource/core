class BadgeController < ApplicationController

  before_action :set_content_type

  rescue_from BadgeFactory::ParseError, KeyError do |e|
    ::NewRelic::Agent.notice_error(e)
    render nothing: true, status: :unprocessable_entity
  end

  rescue_from ActiveRecord::RecordNotFound do |e|
    ::NewRelic::Agent.notice_error(e)
    render nothing: true, status: :not_found
  end

  rescue_from Timeout::Error do |e|
    ::NewRelic::Agent.notice_error(e)
    render nothing: true, status: :not_found
  end

  def issue
    @badge = BadgeFactory.new(params).issue
    render xml: @badge.to_xml
  end

  def tracker
    @badge = BadgeFactory.new(params).tracker
    render xml: @badge.to_xml
  end

  def team
    @badge = BadgeFactory.new(params).team
    render xml: @badge.to_xml
  end

private

  def set_content_type
    headers['Content-Type'] = 'image/svg+xml;charset=utf-8'
  end
end
