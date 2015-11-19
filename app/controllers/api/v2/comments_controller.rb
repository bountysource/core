class Api::V2::CommentsController < Api::BaseController

  def index
    @include_author = params[:include_author].to_bool
    includes = []
    includes << :author if @include_author

    @collection = ::Comment.includes includes
    @include_body_html = (params[:include_body_html] || true).to_bool

    if params[:issue_id]
      @collection = @collection.where issue_id: params[:issue_id]
    end
    @collection = @collection.limit 100
  end

  def show
    @include_body_html = (params[:include_body_html] || true).to_bool

    @include_author = params[:include_author].to_bool
    @include_issue = params[:include_issue].to_bool

    includes = []
    includes << :author if @include_author
    includes << :issue if @include_issue

    @item = ::Comment.find params[:id], include: includes
  end

end
