Api::Application.routes.draw do

  # helpers
  lambda_api_host = lambda { |request| request.host == URI.parse(Api::Application.config.api_url).host }
  lambda_api_force_ssl = lambda { |request| !request.ssl? && URI.parse(Api::Application.config.api_url).scheme == 'https' }
  lambda_salt_host = lambda { |request| request.host == URI.parse(Api::Application.config.salt_url).host }
  lambda_salt_force_ssl = lambda { |request| !request.ssl? && URI.parse(Api::Application.config.salt_url).scheme == 'https' }
  lambda_www_host = lambda { |request| request.host == URI.parse(Api::Application.config.www_url).host }
  lambda_www_force_ssl = lambda { |request| !request.ssl? && URI.parse(Api::Application.config.www_url).scheme == 'https' }
  lambda_short_host = lambda { |request| request.host == URI.parse(Api::Application.config.short_url).host }

  # bnty.co
  scope constraints: lambda_short_host do
    get '(*path)', controller: :shorts, action: :redirect
  end

  # salt.bountysource.com
  scope constraints: lambda_salt_host do
    get '(*path)', to: 'bounty_source#redirect_to_https', constraints: lambda_salt_force_ssl
    get '(*path)', controller: :salt, action: :render_html
  end

  # www.bountysource.com
  scope constraints: lambda_www_host do
    # require HTTPS
    get '(*path)', to: 'bounty_source#redirect_to_https', constraints: lambda_www_force_ssl

    # admin area
    get '/admin/(*path)', to: 'admin#home'

    # badge images... duplicated in API for legacy purposes
    get '/badge/issue', to: 'badge#issue'
    get '/badge/tracker', to: 'badge#tracker'
    get '/badge/team', to: 'badge#team'

    # render angular app (fundraisers and issues get special SEO treatment)
    get '/fundraisers/:id', to: 'bounty_source#fundraiser'
    get '/issues/:id', to: 'bounty_source#issue'
    get '(*path)', to: 'bounty_source#home'
  end

  # api.bountysource.com
  scope constraints: lambda_api_host do
    # require HTTPS
    get '(*path)', to: 'bounty_source#redirect_to_https', constraints: lambda_api_force_ssl

    # badge images... duplicated in WWW for legacy purposes
    get '/badge/issue', to: 'badge#issue'
    get '/badge/tracker', to: 'badge#tracker'
    get '/badge/team', to: 'badge#team'

    # track user generated events (compatible with mixpanel API)
    match '/track', to: 'track#track', via: :get

    # All things money related
    scope path: 'payments', controller: 'payments' do
      post :paypal_ipn
      get :paypal_return
      # Generate JWT for Google Wallet item
      scope path: 'google', controller: :google_wallet do
        get :item_jwt, :success
        post :verify
      end

      scope path: 'coinbase', controller: :coinbase do
        post :callback
        get :success
      end
    end
    match '/support_levels/paypal_return', to: 'api/v2/support_levels#paypal_return', via: :get

    # Our own (un)deliciously home-rolled not-omniauth
    scope path: '/auth/:provider', controller: 'session' do
      get '/', action: :login, as: 'login'
      get :callback
    end

    # API is default route... if host matches and either we don't need SSL or we have SSL, then run
    api vendor_string: 'bountysource', path: '' do

      # ALL ADMINISTRATIVE FUNCTIONS GO HERE
      version 0 do
        scope path: '/admin' do
          get :user, controller: :home
          post :login, controller: :home
          post :search, controller: :home
          get :stats, controller: :home

          resources :request_for_proposals, only: [:index]

          resources :issues, only: [:index, :show, :update] do
            collection do
              get :recent, :closed_with_bounty, :waiting_for_developer, :closed, :open, :paid_out, :counts
            end
          end

          resources :shorts, only: [:index, :create, :update, :show]

          resources :activity_logs, only: [:index]

          resources :developer_goals, only: [:index]

          resources :solutions, only: [:index]

          resources :takedowns, only: [:index, :create]

          resources :team_claims, only: [:index, :update]

          resources :team_payins, only: [:index, :show, :update]

          resources :events, only: [:index]
          resources :tags, only: [:index, :show, :destroy]

          resources :teams, :id => /([^\/])+?/, :format => /json/

          resources :trackers do
            member do
              post :full_sync, :sync
            end
          end

          resources :accounts do
            collection do
              get :overview
            end

            member do
              post :transfer
              get :splits
            end
          end

          resources :people do
            collection do
              get :celebrities
              get :sync_newsletter
              get :access_tokens
            end

            member do
              scope path: 'account', controller: 'accounts/personal' do
                post :transfer_in, :transfer_out, :gift
              end
            end
          end

          resources :bounties do
            member do
              post :refund, :move, :acknowledge, :unacknowledge
            end

            collection do
              get :acknowledged, :unacknowledged
            end
          end

          resources :fundraisers do
            member do
              get :tracker_relations
              post :add_tracker_relation
              delete :remove_tracker_relation
            end
          end

          resources :pledges

          resources :transactions do
            resources :splits

            member do
              put :add_splits
            end

            collection do
              post :sweep
            end
          end

          resources :payments do
            collection do
              get :recent_paypal_ipns
            end
          end

          resources :searches do
            collection do
              get :popular, :bounty
            end
          end

          resources :follows, controller: :follow_relations, only: [:index]

          resources :bounty_claims

          resources :tracker_plugins, only: [:show, :index, :create, :update, :delete]

          resources :cash_outs, only: [:index, :show, :update]

          resources :delayed_jobs, only: [:index, :show] do
            collection do
              get :info
            end

            member do
              post :perform
              root action: :delete, via: :delete
            end
          end

          resources :github_api_errors, only: [:index, :show, :update], controller: "github/api_errors"

          resources :tracker_merges, only: [:index, :show, :destroy] do
            member do
              post :run
            end

            collection do
              :sync
            end
          end

          scope path: :report, controller: :report do
            get :accounts, :transactions, :account_balance, :all_account_balances
            get :paypal, :google_wallet, :bank_of_america, :liability
          end

          resources :splits, only: [:index]

        end
      end



      version 1 do

        # if http://api.bountysource.com/XXX (missing https), redirect to API docs (i.e. you're not using the API correctly, so RTFM)
        #scope constraints: lambda { |request| ssl_is_required && !request.ssl? } do
          #match '(*path)', :to => redirect("/api/docs"), via: :all
        #end

        scope path: '/stats', controller: :stats do
          get '/', action: :global
          match '/trackers/:id', action: :tracker, via: :get
        end

        root :to => 'home#api_docs'
        #root :to => 'bounty_source#home'

        # POSTBACK CONTROLLER FOR LOCAL DEVELOPMENT VIA STAGING
        unless Rails.env.production?
          match 'postbacks/:namespace', controller: 'postbacks', action: :create, constraints: { namespace: /[^\/]+/ }, via: :all
          match 'postbacks/:namespace/retrieve', controller: 'postbacks', action: :retrieve, constraints: { namespace: /[^\/]+/ }, via: :all
        end

        match 'kill_window_js', to: 'home#kill_window_js', via: :get

        get :email_registered, controller: :people

        scope controller: :people do
          get 'users/:profile_id', action: :profile
          get 'users/:profile_id/activity', action: :activity
          get 'people/count', action: :count
          get 'people/:profile_id/teams', action: :teams
          get 'people/:profile_id/activity', action: :activity
          get 'projects', action: :projects

          get :my_languages, action: :languages
          post :my_languages, action: :set_languages
        end

        resource :search do
          get :typeahead, :bounty_search
        end

        match '/tabs', controller: 'saved_search_tabs', action: 'index', via: :get

        resources :languages, only: [:index]

        resources :project_relations, only: [:index, :show], controller: 'tracker_relations'

        resources :projects do
          member do
            get :issues
          end
        end

        # New issues index route, to be replaced by V2 god action.
        match 'doge_issues', controller: :issues, action: :doge_issues, via: :get

        resources :issues, only: [:show, :index] do
          member do
            get :bounties
            get :activity

            resources :developer_goals, controller: :developer_goals, only: [:index, :create]
            resource :developer_goal, controller: :developer_goals, only: [:show, :update, :destroy]
          end

          collection do
            get :featured, :activity, :authored
          end

          resource :solution, controller: :solutions, only: [:show, :create, :update] do
            post :start_work, :check_in, :complete_work, :stop_work
          end

          resources :solutions, only: [:index]
        end

        namespace :fundraisers do
          root action: :all, via: :get
        end

        resource :user, controller: 'people' do
          post  :login, :logout, :change_password, :reset_password, :request_password_reset, :link_paypal
          get   :recent, :contributions, :interesting

          resource :email_verification, only: [:create, :update]
          resource :email_change_verification, only: [:update]

          # not legacy
          get :pledges, :bounties

          resource :address, controller: 'addresses'

          resources :fundraisers do
            resources :rewards

            resources :pledges, controller: 'pledges', only: [:index]

            collection do
              get :cards
            end

            member do
              post :publish
              get :info, :top_backers
            end
          end

          get 'fundraisers/:id/embed', action: :embed, controller: 'fundraisers'

          resources :bounties, only: [:show, :index, :update]

          get 'issues/:id/bounty_total', action: :bounty_total, controller: 'people'

          resources :pledges, only: [:show, :update] do
            member do
              # Not used anymore?
              post :redeem_reward
            end
          end

          resource :notifications do
            get :friends
          end
        end

        # need to remove fundraisers from the user namespace... gah
        match '/fundraisers/cards', controller: :fundraisers, action: :cards, via: :get

        resources :trackers do
          member do
            get :activity, :top_backers
            post :claim, :unclaim
          end

          collection do
            get :cards, :followed
          end

          resource :tracker_plugin
        end

        scope path: 'tags', controller: :tags do
          get '/', action: :all, via: :get

          scope path: ':name', constraints: { name: Tag::ROUTE_REGEX } do
            get '/', action: :one, via: :get

            get :projects
          end
        end

        scope path: 'follows', controller: :follow_relations do
          put '/', action: :follow
          delete '/', action: :unfollow
        end

        resources :teams, only: [:show, :index, :create, :update], id: /([^\/])+?/, format: /json/  do
          member do
            get :activity, :bounties

            scope path: '/trackers' do
              root action: :trackers, via: :get
              match '/:tracker_id', action: :add_tracker, via: :post
              match '/:tracker_id', action: :remove_tracker, via: :delete
            end

            scope path: '/members' do
              get '/', action: :all_members
              post '/', action: :add_member
              match '/:member_id', action: :update_member, via: :put
              match '/:member_id', action: :remove_member, via: :delete
            end

            resource :invites, controller: :team_invites, only: [] do
              get '/', action: :index
              post '/', action: :create
              put '/', action: :accept
              delete '/', action: :reject
            end
          end
        end

        namespace :bulk do
          get :issues, :trackers
        end

        resources :bounty_claims, except: [:new, :edit] do
          member do
            scope path: '/response', controller: :bounty_claim_responses do
              match '/accept',  action: :accept,  via: :put
              match '/reject',  action: :reject,  via: :put
              match '/resolve', action: :resolve, via: :put
              match '/reset',   action: :reset,   via: :put
            end
          end
        end

        resources :tracker_plugins

        scope path: :jobs, controller: :delayed_jobs do
          match '/:id/poll', action: :poll, via: :get
        end

        resources :transactions, only: [:index, :show]

        resources :bounties, only: [] do
          collection do
            get :info
          end
        end


        match '(*path)', to: 'home#api_method_not_found', via: :all
      end

      version 2 do
        cache as: 'v2' do
          resources :issues, only: [:index, :show, :create] do
            collection do
              get :query_v3, to: 'issues#query_v3'
            end

            resource :request_for_proposals, only: [:show, :create, :update, :destroy]
            resources :proposals, only: [:create, :index, :destroy, :show] do
              member do
                post :accept, :reject
              end
            end
          end
          resources :trackers, only: [:index, :show]
          resources :comments, only: [:index, :show]
          resources :bounty_claims, only: [:index, :show]
          resources :fundraisers, only: [:index, :show]
          resources :team_updates, only: [:index, :show, :create, :update] do
            collection do
              get :mailing_lists
            end
          end
          resources :fundraiser_rewards, only: [:index]
          resources :pledges, only: [:index]
          resources :bounties, only: [:index] do
            collection do
              get :summary
            end
          end
          resources :backers, only: [:index]
          resources :teams, only: [:index, :show, :update], :id => /([^\/])+?/, :format => /json/ do
            resources :support_offering_rewards, only: [:create]
          end
          resources :support_offering_rewards, only: [:update, :destroy]
          resources :plugins, only: [:index, :show]
          resources :addresses, only: [:index, :show, :create, :update, :destroy]
          resources :cash_outs, only: [:index, :show, :create, :update, :destroy]
          resources :events, only: [:index, :show, :create, :update]
          resources :currencies, only: [:index]
          resources :timeline, only: [:index]
          resources :developer_goals, only: [:index, :create]
          resources :solutions, only: [:index]
          resources :bounty_claims, only: [:index]
          resources :recommendations, only: [:index, :create]
          resources :tags, only: [:index, :create]
          resources :thumbs, only: [:index, :create]
          resources :payment_methods, only: [:index]
          resources :supporters, only: [:index]
          resources :support_levels, only: [:index, :show, :create, :update, :destroy] do
            collection do
              get :global_summary
            end
          end
          resources :stats, only: [:index]
          resources :issue_suggestions, only: [:index, :create, :update]
          post 'thumbs/index', to: 'thumbs#index'
          post 'thumbs/feedback', to: 'thumbs#feedback'

          resource :account, only: [:show], controller: :account

          resource :cart, only: [:show, :create, :destroy], controller: :cart do
            collection do
              get :checkout
            end
          end
          resources :cart_items, only: [:create, :update, :destroy]

          resources :people, only: [:index, :update] do
            collection do
              get 'me'
              post 'unsubscribe'
            end

            # TODO: refactor into /trackers?person_id=X
            collection do
              resources :trackers, controller: :people_trackers, only: [:index]
            end
          end
        end
      end
    end

    # catch all
    match '(*path)', to: 'api/v1/home#api_method_not_found', via: :all
  end

  # if hostname doesn't match, assume they meant www
  get '(*path)', to: 'bounty_source#redirect_to_www'

end
