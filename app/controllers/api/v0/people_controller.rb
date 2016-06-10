class Api::V0::PeopleController < Api::V0::BaseController
  def index
    @people = Person.includes(:github_account, :twitter_account).order('created_at desc')
    render "api/v1/people/index_admin"
  end

  def celebrities
    @people = Person.celebrity.map { |person,_| person }
    render "api/v1/people/index_admin"
  end

  def show
    @person = Person.find_by_id(params[:id])
    # @bounty_claims = @person.bounty_claims

    render "api/v1/people/show_admin"
  end

  def update
    @person = Person.find_by_id params[:id]
    attrs = params.select { |k,_| Person.accessible_attributes.include? k }
    @person.update_attributes!(attrs) unless attrs.empty?

    render "api/v1/people/show_admin"
  end

  def destroy
    @person = Person.find_by_id params[:id]
    @person.safe_destroy
    render "api/v1/people/show_admin"
  end

  def sync_newsletter
    render json: Sendgrid.sync
  end

  def access_tokens
    @tokens = AccessToken.order('created_at desc').includes(:person)
    render "api/v0/access_tokens"
  end
end
