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

    when 'gittip', 'gratipay'
      @linked_account = LinkedAccount::Gittip.find_by_oauth_token params[:external_access_token]
      @person         = Person.find_by_access_token(params[:gittip_access_token] || params[:gratipay_access_token])
      @redirect_url   = params.delete :redirect_url
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

  def connect
    require_params :redirect_url, :external_access_token

    case params[:provider]
    when 'gittip', 'gratipay'
      if !LinkedAccount::Gittip.access_token_valid?(params[:external_access_token])
        render json: { error: 'Unauthorized access' }, status: :unauthorized
      else
        # find linked account
        linked_account = LinkedAccount::Gittip.find_via_access_token params[:external_access_token]

        # use cases
        if @person && linked_account
          # append access token of BS account to redirect query string
          uri = URI.parse(params[:redirect_url])
          redirect_params = Rack::Utils.parse_nested_query(uri.query).with_indifferent_access

          if linked_account.person == @person
            redirect_params.merge! access_token: linked_account.oauth_token

            # merge person info onto redirect
            person_attribute_keys = %w(id display_name first_name last_name email image_url)
            redirect_params.merge! @person.attributes.select { |k,_| person_attribute_keys.include? k.to_s }
            redirect_params.merge! frontend_url: @person.frontend_url
          else
            # logged in, but account is linked with another person. Just return to Gittip account page
            # with an error message

            redirect_params.merge! error: 'Bountysource account has already been linked.'
          end

          # put params back on redirect url
          uri.query = redirect_params.to_param

          # all done, GTFO
          return redirect_to uri.to_s
        else
          # person is not logged in, show account required form
          # whitelist the payload from Gittip (also removes rails stuff, like :action and :controller)
          connect_params = LinkedAccount::Gittip.whitelisted_params(params).merge(
            status: 'error_needs_account'
          )

          redirect_to "#{Api::Application.config.www_url}#auth/#{params[:provider]}/connect?#{connect_params.to_param}"
        end
      end
    else
      render json: { error: 'Unsupported provider' }, status: :bad_request
    end
  end

  def approve_connect
    require_params :external_access_token

    case params[:provider]
    when 'gittip','gratipay'
      @linked_account = LinkedAccount::Gittip.find_via_access_token params[:external_access_token]

      if @linked_account
        # if the account has already been linked, cannot link again.
        if @linked_account.person != @person
          return render json: { error: 'Account already linked' }, status: :bad_request
        end
      else
        @linked_account = LinkedAccount::Gittip.create_via_access_token(
          person:       @person,
          oauth_token:  params[:external_access_token],
          login:        params[:login],
          first_name:   params[:first_name],
          last_name:    params[:last_name],
          email:        params[:email],
          image_url:    params[:image_url]
        )

        unless @linked_account.valid?
          return render json: { error: 'There was problem linking your account' }, status: :bad_request
        end
      end

      # if we got here, an account was successfully linked. append access token to redirect url
      uri = URI.parse(params[:redirect_url])
      redirect_params = Rack::Utils.parse_nested_query uri.query
      redirect_params.merge! access_token: @linked_account.oauth_token

      # merge person info onto redirect
      person_attribute_keys = %w(id display_name first_name last_name email frontend_url)
      redirect_params.merge! @person.attributes.select { |k,_| person_attribute_keys.include? k.to_s }
      redirect_params.merge! frontend_url: @person.frontend_url
      redirect_params.merge! image_url: @person.image_url

      # rewrite uri params
      uri.query = redirect_params.to_param

      render json: { redirect_url: uri.to_s }
    else
      render json: { error: 'Unsupported provider' }, status: :bad_request
    end
  end

end
