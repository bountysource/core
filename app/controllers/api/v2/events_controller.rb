class Api::V2::EventsController < Api::BaseController

  before_action :parse_boolean_values

  def index
    @collection = ::Event.all
  end

  def show
    @item = ::Event.find_by_slug! params[:id]
  end

  def create
    @item = ::Event.new

    authorize! :manage_events, @item

    @item.slug = params[:slug] if params.has_key?(:slug)
    @item.title = params[:title] if params.has_key?(:title)
    @item.subtitle = params[:subtitle] if params.has_key?(:subtitle)
    @item.url = params[:url] if params.has_key?(:url)
    @item.issue_ids = (params[:issue_ids] || '').split(',').map(&:to_i)

    @item.save!

    render 'api/v2/events/show', status: :created
  end

  def update
    @item = ::Event.find_by_slug! params[:id]

    authorize! :manage_events, @item

    @item.slug = params[:slug] if params.has_key?(:slug)
    @item.title = params[:title] if params.has_key?(:title)
    @item.subtitle = params[:subtitle] if params.has_key?(:subtitle)
    @item.url = params[:url] if params.has_key?(:url)
    @item.issue_ids = (params[:issue_ids] || '').split(',').map(&:to_i)

    @item.save!

    render 'api/v2/events/show', status: :ok
  end

  private

  def parse_boolean_values
    @include_issues = params[:include_issues].to_bool
  end

end
