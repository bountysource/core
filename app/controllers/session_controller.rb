class SessionController < ApplicationController

  before_filter :require_auth, only: [:approve_connect]

  WHITELISTED_REDIRECT_URL = /^https?:\/\/((www|api|salt)\.bountysource\.com)\//

  # get an oauth code, which is exchanged for an access_token in #callback
  def login
    state_json = {
      redirect_url: params[:redirect_url],
      access_token: params[:access_token],
      ip: request.remote_ip
    }

    unless params[:mixpanel_id].blank?
      state_json.merge!(mp_id: params[:mixpanel_id])
    end

    encoded_state = LinkedAccount::Base.encode_state(state_json)

    case params[:provider]
      when 'github'
        redirect_to LinkedAccount::Github::User.oauth_url(scope: params[:scope], state: encoded_state)

      when 'facebook'
        redirect_to LinkedAccount::Facebook.oauth_url(scope:  params[:scope], state: encoded_state)

      when 'twitter'
        redirect_to LinkedAccount::Twitter.oauth_url(scope:  params[:scope], state: encoded_state)

      else render json: { error: 'Unsupported provider' }, status: :bad_request
    end
  end

  # exchange an Oauth code for access_token. auto-create an account if necessary, and return
  # to frontend with account_link info.
  def callback
    # first, load the state (redirect_url, access_token)
    state = params[:state] ? LinkedAccount::Base.decode_state(params[:state]) : {}

    # set @linked_account, @redirect_url, and optionally @person
    case params.try(:[], :provider)
    when 'github'
      
      @linked_account = LinkedAccount::Github::User.find_or_create_via_oauth_code params[:code]
      @person         = Person.find_by_access_token(state[:access_token])
      @redirect_url   = state[:redirect_url]

    when 'facebook'
      @linked_account = LinkedAccount::Facebook.find_or_create_via_oauth_code params[:code]
      @person         = Person.find_by_access_token(state[:access_token])
      @redirect_url   = state[:redirect_url]

    when 'twitter'
      @linked_account = LinkedAccount::Twitter.find_or_create_via_oauth_token_and_verifier(params[:oauth_token], params[:oauth_verifier])
      @person         = Person.find_by_access_token(state[:access_token])
      @redirect_url   = state[:redirect_url]
    end

    # run through all of the use cases
    if @person && (@person == @linked_account.person)
      # nothing to do... @person is already logged in and linked to this account.
      opts = { status: 'linked', access_token: @person.create_access_token(request) }
    elsif @person && !@linked_account.person
      # should be safe to link this account to the logged in @person
      @linked_account.link_with_person(@person)
      opts = { status: 'linked', access_token: @person.create_access_token(request) }
    elsif @person
      # error! @person logged in but not the same as @linked_account.person
      opts = { status: 'error_already_linked' }
    elsif @linked_account.person
      opts = { status: 'linked', access_token: @linked_account.person.create_access_token(request) }

      # Alias Person ID with randomly generated Mixpanel distinct_id.
      unless state[:mp_id].blank?
        begin
          MixpanelAlias.claim(@linked_account.person.id, state[:mp_id])
        rescue MixpanelAlias::AlreadyClaimed
          opts[:reset_mixpanel_id] = true
        end
      end

    else
      # nobody logged in, and no person on this account... they need to create an account
      opts = {
        status:               'error_needs_account',
        email_is_registered:  !!Person.find_by_email(@linked_account.email),
        account_link_id:      "#{params[:provider]}:#{@linked_account.create_access_token}",
        first_name:           @linked_account.first_name,
        last_name:            @linked_account.last_name,
        email:                @linked_account.email,
        image_url:            @linked_account.image_url,
        display_name:         @linked_account.login
      }
    end

    # redirect, should be provider-agnostic
    raise MissingRequiredParams, :redirect_url unless Rails.env.development? || (@redirect_url =~ WHITELISTED_REDIRECT_URL)

    # tack on params
    redirect_to @redirect_url + (@redirect_url['?'] ? '&' : '?') + opts.to_param
  end

end
