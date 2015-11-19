class Api::V2::CartController < Api::BaseController

  include Api::V2::CartHelper

  before_filter :require_cart, except: [:create]
  before_filter :require_auth, only: [:checkout]
  before_filter :require_checkout_method, only: [:checkout]

  def show
    @item_count = @cart.items.count

    # Load raw item attribute as well as instance of ActiveRecord::Base
    # to fetch related models (Fundraiser, Issue, Team, etc.).
    @items = @cart.items.map do |item_json|
      [
        item_json,
        @cart.item_from_attributes(item_json)
      ]
    end

    @items.reject! {|item| item[1].nil? }

    @include_items = true
  end

  def destroy
    @cart.clear
    render nothing: true, status: :no_content
  end

  def checkout
    require_params :checkout_method, :currency

    # If Person has nothing in their cart, render error immediately.
    if @cart.items.empty?
      @cart.errors.add(:cart, 'is empty')
      raise ActiveRecord::RecordInvalid.new @cart
    end

    # For internal checkout method accounts, we immediately create transaction.
    # Note: Minimum balance is already required in before_filter
    if @checkout_method.is_a?(Account::Personal) || @checkout_method.is_a?(Account::Team)
      order = Transaction::Order::Internal.create_from_cart_and_checkout_method(@cart, @checkout_method)
      render json: { receipt_url: order.www_receipt_url }

    # Redirect to PayPal checkout URL
    elsif @checkout_method.is_a?(Account::Paypal)
      render json: { checkout_url: @cart.create_paypal_checkout_url }, status: :ok

    # Render the JWT for purchasing the shopping cart (encoded with our merchant secret)
    elsif @checkout_method.is_a?(Account::GoogleWallet)
      render json: { jwt: @cart.create_google_wallet_jwt }, status: :accepted

    # Render the JSON to trigger a Coinbase payment modal
    elsif @checkout_method.is_a?(Account::Coinbase)
      options = {
        cancel_url: params[:cancel_url],
        currency: params[:currency] || 'USD'
      }
      checkout_url = @cart.create_coinbase_checkout_url(options)
      render json: { checkout_url: checkout_url }, status: :accepted
    end
  end

  def create
    @cart = ShoppingCart.create!
    render 'api/v2/cart/show'
  end

private

  def require_cart
    @cart = ShoppingCart.find_or_create(
      uid: params[:uid],
      person: current_user,
      autocreate: params.has_key?(:autocreate) ? params[:autocreate].to_bool : true
    )
  end

  def require_checkout_method
    require_params :checkout_method

    case params[:checkout_method].downcase.strip
    when 'paypal'
      @checkout_method = Account::Paypal.instance

    when 'google'
      @checkout_method = Account::GoogleWallet.instance

    when 'coinbase'
      @checkout_method = Account::Coinbase.instance

    when 'personal'
      person = current_user
      @checkout_method = person.account || person.create_account

      # Render error if Personal account does not have enough money to purchase cart.
      gross = @cart.calculate_gross
      account_balance = @checkout_method.balance

      if account_balance < gross
        render json: { error: 'Insuffient account balance' }, status: :bad_request
      end

    when %r{\Ateam/(\d+)\Z}
      # TODO factor out global variable usage
      team = Team.find_by_id($1)

      # Render not found if team does not exist, OR if the person is not authorized to spend from team account.
      if !team || cannot?(:use_team_account, team)
        render json: { error: 'Team not found' }, status: :not_found
      end

      @checkout_method = team.account || team.create_account

      gross = @cart.calculate_gross
      account_balance = @checkout_method.balance

      # Render error if the team members balance does not have enough money.
      member_relation = team.member_relations.find_by person_id: current_user.id
      if member_relation.balance.present? && member_relation.balance < gross
        return render json: { error: 'Insufficient funds in your spending budget' }, status: :bad_request
      end

      # Render error if Team account does not have enough money to purchase cart.
      if account_balance < gross
        render json: { error: 'Insufficient account balance' }, status: :bad_request
      end

    else
      render json: { error: 'Invalid checkout method' }, status: :bad_request
    end
  end

end
