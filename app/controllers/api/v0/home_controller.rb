class Api::V0::HomeController < Api::V0::BaseController

  skip_before_action :require_admin, only: [:login]

  def login
    require_params :email, :password

    if (@person = Person.authenticate(params[:email], params[:password]))
      if @person.admin?
        render json: { access_token: @person.create_access_token(request) }
      else
        render json: { error: 'Unauthorized access' }, status: :unauthorized
      end
    else
      render json: { error: 'Account not found' }, status: :not_found
    end
  end

  def user
    render json: { access_token: params[:access_token] }
  end

  def search
    q = params[:query]

    @people = Person.admin_search(q)
    @bounties = Bounty.admin_search(q)
    @fundraisers = Fundraiser.admin_search(q)
    #@trackers = Tracker.admin_search(q)
    @transactions = PaymentNotification::Paypal.admin_search(q)

    render "api/v0/searches/index"
  end

  def stats
    render json: AdminStat.singleton.all
  end

end
