class Api::V2::CartController < Api::BaseController

  include Api::V2::CartHelper

  before_action :require_auth
  before_action :generate_cart_and_item
  before_action :require_checkout_method

  def create
    # If Person has nothing in their cart, render error immediately.
    if @cart.items.empty?
      @cart.errors.add(:cart, 'is empty')
      raise ActiveRecord::RecordInvalid.new @cart
    end

    # For internal checkout method accounts, we immediately create transaction.
    # Note: Minimum balance is already required in before_action
    if @checkout_method.is_a?(Account::Personal) || @checkout_method.is_a?(Account::Team)
      order = Transaction::Order::Internal.create_from_cart_and_checkout_method(@cart, @checkout_method)
      render json: { checkout_url: order.www_receipt_url }

    # Redirect to PayPal checkout URL
    elsif @checkout_method.is_a?(Account::Paypal)
      render json: { checkout_url: @cart.create_paypal_checkout_url }, status: :ok
    end
  end

private

  def generate_cart_and_item
    @cart = ShoppingCart.create(
      person: current_user
    )
    @item = @cart.add_item(bounty_params.to_h) if bounty_params
    @item = @cart.add_item(team_payin_params.to_h) if team_payin_params
  end

  def bounty_params
    params.require(:item).permit(:amount, :owner_id, :owner_type, :anonymous, :issue_id, :bounty_expiration, :upon_expiration, :tweet, :item_type, :total, :currency) if params[:item]
  end

  def team_payin_params
    params.require(:team_payin).permit(:amount, :owner_id, :owner_type, :team_id, :currency, :item_type) if params[:team_payin]
  end

  def require_checkout_method
    require_params :checkout_method

    case params[:checkout_method].downcase.strip
    when 'paypal'
      @checkout_method = Account::Paypal.instance

    # when 'coinbase'
      # @checkout_method = Account::Coinbase.instance

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
