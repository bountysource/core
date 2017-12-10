class Api::V0::AccountsController < Api::V0::BaseController

  before_filter :require_account,           only: [:show]
  before_filter :require_receiving_account, only: [:transfer]
  before_filter :require_losing_account,    only: [:transfer]
  before_filter :require_payment_amount,    only: [:transfer]

  rescue_from Account::NotEnoughFunds do |e|
    render json: { error: "Insufficient account balance" }, status: :bad_request
  end

  def transfer
    require_params :receiving_account_id, :losing_account_id, :amount
    @transfer = Account.transfer! from: @losing_account, to: @receiving_account, amount: @amount
    render json: @transfer
  end

  def show
    render "api/v1/accounts/admin"
  end

  def overview
    # collect all account classes defined in app/models/account
    all_account_classes = Dir[Rails.root.join('app/models/account/*.rb')].map do |f|
      if (file_name = f.match(/(\w+)\.rb$/).try(:[], 1))
        klass = "Account::#{file_name.camelize}".constantize
        klass if klass.count > 0
      end
    end.compact

    standalone_account_classes  = Account.standalone.pluck(:type).map(&:constantize)
    item_account_classes        = all_account_classes - standalone_account_classes

    accounts = {
      total_balance:  Split.sum(:amount),
      standalone:     Account.standalone,
      item:           item_account_classes
    }

    # standalone accounts are objects, and item accounts are classes.
    accounts[:standalone].map! do |account|
      {
        id:       account.id,
        type:     account.class.name,
        balance:  account.balance
      }
    end

    accounts[:item].map! do |klass|
      {
        type:     klass.name,
        count:    klass.count,
        balance:  klass.joins(:splits).sum('splits.amount')
      }
    end

    render json: accounts
  end

protected

  def require_account
    unless (@account = Account.where(id: params[:id]).includes(:splits => [:txn, :account]).first)
      render(json: { error: "Account not found" }, status: :not_found)
    end
  end

  def require_receiving_account
    unless (@receiving_account  = Account.find_by_id params[:receiving_account_id])
      render(json: { error: "Receiving payment account not found" }, status: :not_found)
    end
  end

  def require_losing_account
    unless (@losing_account  = Account.find_by_id params[:losing_account_id])
      render(json: { error: "Losing payment account not found" }, status: :not_found)
    end
  end

  def require_payment_amount
    @amount = Money.new(params[:amount].to_i*100, params[:payment_currency] || 'USD')
  end
end
