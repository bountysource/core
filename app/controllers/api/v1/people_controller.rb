class Api::V1::PeopleController < ApplicationController
  respond_to :json

  before_filter :require_auth,    except: [:recent, :profile, :activity, :login, :create, :reset_password, :request_password_reset, :interesting, :count, :teams, :email_registered]
  before_filter :require_profile, only:   [:profile, :activity, :teams]

  # show all of the authenticated user's info
  def show
    # currently, this is where the user's auth token gets checked against, so might as well associate mixpanel_id if we can
    unless params[:mixpanel_id].blank?
      begin
        MixpanelAlias.claim(@person.id, params[:mixpanel_id])
      rescue MixpanelAlias::AlreadyClaimed
        @reset_mixpanel_id = true
      end
    end
  end

  # show any user's profile. same thing as show if viewing your own profile
  def profile
  end

  # get info about the user's account
  def account
    # TODO exclude promotional money
    @account = @person.account
    render "api/v1/accounts/show"
  end

  # create a new BountySource account
  def create
    if params[:full_name] && !params[:first_name] && !params[:last_name]
      params[:first_name], params[:last_name] = params[:full_name].split(' ', 2)
    end

    @person = Person.new(
      email:                  params[:email],
      display_name:           params[:display_name],
      first_name:             params[:first_name],
      last_name:              params[:last_name],
      password:               params[:password],
      password_confirmation:  params[:password],
      terms:                  params[:terms].to_bool,
      company:                params[:company]
    )

    temp_password = "Aa1#{SecureRandom.urlsafe_base64}"

    case params[:account_link_id]
    when /^github:(.*)$/
      # load github user
      @linked_account = LinkedAccount::Github::User.find_by_access_token($1)
      raise ActiveRecord::RecordNotFound unless @linked_account && @linked_account.person.nil?

      # create person
      @person.password = temp_password
      @person.password_confirmation = temp_password

      new_relic_data_point "Custom/account/create/github", 1

      # Facebook and Twitter
    when /^(facebook|twitter):(.*)$/
      @linked_account = LinkedAccount::Base.find_by_access_token($2)
      raise ActiveRecord::RecordNotFound unless @linked_account && @linked_account.person.nil?

      # create person
      @person.password = temp_password
      @person.password_confirmation = temp_password

      new_relic_data_point "Custom/account/create/#{$1}", 1

      # Gittip
    when /^(gittip|gratipay):(.*)$/
      # nothing to do anymore, just kick back to Gittip
      redirect_to params[:redirect_url] || Api::Application.config.gittip_url

      # create person
      @person.password = temp_password
      @person.password_confirmation = temp_password

      new_relic_data_point "Custom/account/create/gittip", 1

    else
      # normal use case
      new_relic_data_point "Custom/account/create/email", 1
    end

    if @person.valid?
      @person.save!

      # Link account with Person after saved
      defined?(@linked_account) and @linked_account.link_with_person(@person)

      # Link with Mixpanel
      unless params[:mixpanel_id].blank?
        begin
          MixpanelAlias.claim(@person.id, params[:mixpanel_id])
        rescue MixpanelAlias::AlreadyClaimed
          @reset_mixpanel_id = true
        end
      end

      @person.create_access_token(request)
      render "api/v1/people/create"
    else
      # Override the password error message here instead of in the model.
      # We probably want the more specific error, albeit less humanized, messages
      # throughout the rest of the backend.
      if @person.errors.has_key?(:password)
        @person.errors.delete(:password)
        @person.errors.delete(:password_digest)
        @person.errors.add(:password, "must be at least 8 characters long and must contain a letter and a number")
      end

      render json: { error: @person.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end

  rescue ActiveRecord::RecordNotFound
    render json: { error: "Unable to create account: Invalid account link" }, status: :unprocessable_entity
  end

  # login to an existing BountySource account
  def login
    if !(@person = Person.active.find_by_email(params[:email]))
      render json: { error: 'Email address not found.', email_is_registered: false }, status: :not_found
    elsif !@person.authenticate(params[:password])
      render json: { error: 'Password not correct.', email_is_registered: true }, status: :not_found
    else
      # load person on mixpanel
      unless params[:mixpanel_id].blank?
        begin
          MixpanelAlias.claim(@person.id, params[:mixpanel_id])
        rescue MixpanelAlias::AlreadyClaimed
          @reset_mixpanel_id = true
        end
      end

      case params[:account_link_id]
        when /^github:(.*)$/
          # login but with a github link ready to happen
          new_relic_data_point "Custom/sign_in/github", 1

          if !(github_account = LinkedAccount::Github::User.find_by_access_token($1))
            render json: { error: "Unable to find Github account", email_is_registered: true }, status: :not_found
          elsif github_account.person
            render json: { error: "Github account already linked", email_is_registered: true }, status: :not_found
          else
            github_account.link_with_person @person
            render_login_rabl
          end

        # Facebook and Twitter
        when /^(facebook|twitter):(.*)$/
          new_relic_data_point "Custom/sign_in/#{$1}"

          if !(linked_account = LinkedAccount::Base.find_by_access_token($2))
            render json: { error: "Unable to find #{$1.capitalize} user", email_is_registered: true }, status: :not_found
          elsif linked_account.person
            render json: { error: "#{$1.capitalize} account already linked", email_is_registered: true }, status: :not_found
          else
            linked_account.link_with_person @person
            render_login_rabl
          end

        # Gittip
        when /^(gittip|gratipay):(.*)$/
          if !(linked_account = LinkedAccount::Gittip.find_by_oauth_token $2)
            render json: { error: "Unable to find #{$1.capitalize} account", email_is_registered: true }, status: :not_found
          elsif linked_account.person
            render json: { error: "#{$1.capitalize} account already linked", email_is_registered: true }, status: :not_found
          else
            linked_account.link_with_person @person
            render_login_rabl
          end

        else
          # normal login
          new_relic_data_point "Custom/sign_in/email", 1
          render_login_rabl
      end
    end
  end

  def logout
    raise "Token is missing" unless @person.current_access_token
    @person.access_tokens.where(token: @person.current_access_token).delete_all
    render json: {}, status: :ok
  end

  # update the BountySource account
  def update
    [:email, :display_name, :first_name, :last_name, :password, :paypal_email, :image_url, :bio, :location, :public_email, :company, :url].each do |field|
      @person.send("#{field}=", params[field]) if params.has_key?(field)
    end

    @person.profile_completed = params[:profile_completed].to_bool if params.has_key?(:profile_completed)

    if @person.save
      render "api/v1/people/show"
    else
      render json: { error: "Unable to update account: #{@person.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    end
  end

  # change the authenticated user's password
  def change_password
    require_params(:current_password, :new_password, :password_confirmation)

    if @person.authenticate(params[:current_password])
      @person.password = params[:new_password]
      @person.password_confirmation = params[:password_confirmation]

      if @person.save
        render "api/v1/people/show"
      else
        render json: { error: "Unable to change password: #{@person.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Current password not correct' }, status: :unauthorized
    end
  end

  def reset_password
    require_params(:email, :code, :new_password)

    if params[:email].blank?
      render json: { error: 'Must provide account email address or display name' }, status: :bad_request
    elsif (person = Person.find_by_email(params[:email]))
      if person.reset_password_code == params[:code]
        person.password = params[:new_password]
        person.password_confirmation = person.password

        if person.save
          render json: { message: 'Password reset' }, status: :reset_content
        else
          render json: { error: "Unable to reset password: #{person.errors.full_messages.join(', ')}" }, status: :bad_request
        end
      else
        render json: { error: 'Reset code is not valid' }, status: :bad_request
      end
    else
      render json: { message: 'Account not found' }, status: :not_found
    end
  end

  def request_password_reset
    require_params(:email)

    if (person = Person.find_by_email(params[:email]))
      person.send_email(:reset_password)
      render json: { message: 'Password reset email sent' }
    else
      render json: { error: 'Account not found' }, status: :not_found
    end
  end

  def recent
    # this is specific to however our frontend works at the moment
    per_row = 17
    num_rows = 2

    @people = Person.order('created_at desc').includes(:github_account, :twitter_account, :gittip_account).limit(200).first(per_row * num_rows)
    @total_count = Person.count

    render "api/v1/people/recent"
  end

  def contributions
  end

  def pledges
    @pledges = @person.pledges.includes(:owner, :fundraiser, :reward).order('created_at desc')
  end

  def bounties
    @bounties = @person.bounties.includes(:owner, :issue => [:tracker]).order('created_at desc')
  end

  def bounty_total
    @bounty_total = @person.bounties.where("issue_id = ?", params[:id]).active.inject(0){|total,bounty| total += bounty.amount}.to_i
  end

  def tracker_plugins
    @tracker_plugins = @person.tracker_plugins
    render "api/v1/tracker_plugins/index"
  end

  def project_relations
    @tracker_relations = @person.tracker_relations
    render "api/v1/tracker_relations/index"
  end

  # get the top developers and contributors
  def interesting
    max_people = 10

    @top_backers_map = Person.top_backers.merge(Team.top_backers)
    @top_backers = @top_backers_map.to_a.sort { |(_,total1),(_,total2)| total2 <=> total1 }.map { |(owner,_)| owner }.first(max_people)

    # { person_id => total, ... }
    @top_earners_map = Person.top_earners
    @top_earners = @top_earners_map.to_a.sort { |(_,total1),(_,total2)| total2 <=> total1 }.map { |(person,_)| person }.first(max_people)

    @celebrities = Person.celebrity.limit(max_people)
    @new = Person.order("created_at desc").limit(max_people)
  end

  def count
    render json: {
      total: Person.count
    }, status: :ok
  end

  # show the teams that this person is publicly listed in.
  # Note: There is probably a better query for this, but this works for now at ~150-200ms
  def teams
    @team_relations = TeamMemberRelation.where(person_id: @profile_person).select { |rel| rel.public? || @person && rel.team.person_is_member?(@person) }
  end

  # Very fast check to see if an email address is registered. Needs to be an exact match
  def email_registered
    render json: { registered: !Person.where(email: params[:email]).empty? }, status: :ok
  end

  def activity
    @bounties = @profile_person.active_bounties.where(anonymous: false).includes(:owner, :issue => [:tracker]).order("created_at desc").limit(50)
    @pledges = @profile_person.pledges.where(anonymous: false).includes(:owner, :fundraiser).order("created_at desc").limit(50)
    @fundraisers = @profile_person.fundraisers.where(published: true).order("created_at desc").limit(50)
    @team_relations = @profile_person.team_member_relations.where(public: true).order("created_at desc").limit(50)
    bounty_claim_ids = @profile_person.bounty_claims.order("created_at desc").limit(50).pluck(:id)
    @bounty_claim_events_collected = BountyClaimEvent::Collected.where(bounty_claim_id: bounty_claim_ids).includes(:bounty_claim => :issue)
  end

  # Projects that belong to you <3
  def projects
    @tracker_relations = @person.tracker_relations.includes(:tracker)
  end

  def languages
    @languages = @person.languages
  end

  def set_languages
    language_ids = (params[:language_ids] || '').split(',')
    @person.set_languages(*language_ids)

    render nothing: true, status: :ok
  end

protected

  def render_login_rabl
    @person.create_access_token(request)
    render 'api/v1/people/login'
  end

  def require_profile
    @profile_person = Person.where(id: params[:profile_id]).first

    unless @profile_person
      render json: { error: 'Profile not found' }, status: :not_found
    end
  end
end
