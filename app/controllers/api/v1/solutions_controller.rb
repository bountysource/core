class Api::V1::SolutionsController < ApplicationController
  before_filter :require_auth, except: [:index]
  before_filter require_issue(:issue_id)
  before_filter :require_solution, except: [:create, :index]

  after_filter log_activity(Issue::Event::START_WORK), only: [:create]
  after_filter log_activity(Issue::Event::STOP_WORK), only: [:stop_work]
  after_filter log_activity(Issue::Event::RESTART_WORK), only: [:start_work]

  def create
    # parse completion_date to turn it into a date time object
    if params[:completion_date].blank?
      parsed_date_time = ""
    else
      parsed_date_time = DateTime.parse(params[:completion_date])
    end
    
    #start event is triggered on after_create
    @solution = Solution.create(
      issue: @issue,
      person: @person,
      note: params[:note],
      url: params[:url],
      completion_date: parsed_date_time
    )

    if @solution.errors.empty?
      render "api/v1/solutions/show", status: :created
    else
      render json: { error: @solution.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def show
  end

  def index
    @issue_solutions = @issue.solutions
  end

  def update
    if params[:completion_date].blank?
      parsed_date_time = ""
    else
      parsed_date_time = DateTime.parse(params[:completion_date])
    end

    @solution.url = params[:url]
    @solution.note = params[:note]
    @solution.completion_date = parsed_date_time
    
    if @solution.save
      render "api/v1/solutions/show"
    else
      render json: { error: @solution.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def start_work
    # this is called when a solution is updated
    @solution.url = params[:url] unless params[:url].blank?
    @solution.note = params[:note] unless params[:note].blank?
    @solution.completion_date = DateTime.parse(params[:completion_date]) unless params[:completion_date].blank?
    @solution.start_work

    if @solution.save
      render "api/v1/solutions/show"
    else
      render json: { error: @solution.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end
  
  def check_in
    @solution.checkin

    if @solution.errors.empty?
      render "api/v1/solutions/show"
    else
      render json: { error: @solution.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def complete_work
    #probably will delete this. This might be confused with bounty claims.
    @solution.completed_work

    if @solution.errors.empty?
      render "api/v1/solutions/show"
    else
      render json: { error: @solution.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def stop_work
    @solution.stop_work

    if @solution.errors.empty?
      render "api/v1/solutions/show"
    else
      render json: { error: @solution.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

protected

  def require_solution
    unless (@solution = @issue.solution_for_person(@person))
      render json: { error: "Solution not found" }, status: :not_found
    end
  end
end
