class Api::V2::CashOutsController < Api::BaseController

  include Api::V2::CashOutsHelper

  before_action :require_auth
  before_action :parse_boolean_values
  before_action :require_cash_out, only: [:show, :update, :delete]

  def index
    @collection = current_user.cash_outs.order('created_at desc')

    @collection = filter!(@collection)
    @collection = order!(@collection)
  end

  def show
    @include_person = true
    @include_address = true
    @include_mailing_address = true
  end

  def create
    if team_id = params[:source].try(:match, /\Ateam(\d+)\Z/).try(:[], 1)
      account = current_user.team_member_relations.where(admin: true, team_id: team_id).first.try(:team).try(:account)
    else
      account = current_user.account
    end

    if !account
      render json: { error: "Invalid account" }, status: :unprocessable_entity
      return
    elsif params[:amount].to_f > account.balance
      render json: { error: "Insufficient account balance" }, status: :unprocessable_entity
      return
    end

    @item = CashOut.parse(params[:type])

    @item.person = current_user
    @item.amount = params[:amount].to_f
    @item.account = account

    @item.remote_ip = request.remote_ip
    @item.user_agent = request.user_agent

    @item.paypal_address = params[:paypal_address]
    @item.bitcoin_address = params[:bitcoin_address]
    @item.ripple_address = params[:ripple_address]
    @item.mastercoin_address = params[:mastercoin_address]

    # Safely find addresses. Don't want to raise 404 on these,
    # the rendered error would be confusing considering this is a cash_out action.
    @item.address = current_user.addresses.find_by(id: params[:address_id])
    @item.mailing_address = current_user.addresses.find_by(id: params[:mailing_address_id])

    # Record US citizen boolean if it was explicitly set to true or false.
    # We want to write NULL if that is the value, or the parameter is missing.
    if params.has_key? :us_citizen
      @item.us_citizen = params[:us_citizen].to_bool
    end

    # Record fee for cash out on model
    @item.fee = current_user.account.calculate_cash_out_fee(@item.amount)

    @item.save!

    MixpanelEvent.track(
      person_id: current_user.id,
      event: 'Create Cash Out',
      type: @item.type_name,
      cash_out_id: @item.id,
      amount: @item.amount,
      us_citizen: @item.us_citizen
    )

    # Move money from the Person's account so that it
    # cannot be spent while the cash out is being processed.
    @item.hold_amount!

    response.status = 201
    render 'api/v2/cash_outs/show'
  end

  def update
    @item = ::CashOut.find params[:id]

    if !@item.sent? && params.has_key?(:refund)
      @item.update_attributes!(sent_at: DateTime.now, is_refund: true)
      @item.refund!
      head :ok
    end
  end

  def delete
    head :not_implemented
  end

private

  def parse_boolean_values
    @include_person = params[:include_person].to_bool
    @include_address = params[:include_address].to_bool
    @include_mailing_address = params[:include_mailing_address].to_bool
  end

  def require_cash_out
    @item ||= current_user.cash_outs.find params[:id]
  end

end
