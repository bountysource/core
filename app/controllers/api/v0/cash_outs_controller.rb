class Api::V0::CashOutsController < Api::V0::BaseController

  include Api::V2::CashOutsHelper

  def index
    @collection = ::CashOut.includes(:person, :address, :mailing_address, :account => :owner).order('created_at asc')

    @include_person = true
    @include_person_email = true
    @include_address = true
    @include_mailing_address = true
    @include_yearly_cash_out_totals = true
    @include_account_owner = true

    @collection = filter!(@collection)
    @collection = order!(@collection)

    render 'api/v2/cash_outs/index'
  end

  def show
    @item = ::CashOut.find params[:id]

    @include_person = true
    @include_person_email = true
    @include_address = true
    @include_mailing_address = true
    @include_yearly_cash_out_totals = true
    @include_account_owner = true

    render 'api/v2/cash_outs/show'
  end

  def update
    @item = ::CashOut.find params[:id]

    # Mark as sent
    if !@item.sent? && params.has_key?(:sent)
      @item.update_attributes!(sent_at: DateTime.now)
      @item.release_amount!
      @item.person.send_email(:cash_out_payment_sent, cash_out: @item)

      # Send Mixpanel event if cash out marked as sent
      MixpanelEvent.track(
        person_id: @item.person.id,
        event: "Send Cash Out",
        type: @item.type_name,
        cash_out_id: @item.id,
        amount: @item.amount,
        us_citizen: @item.us_citizen
      )
    elsif !@item.sent? && params.has_key?(:refund)
      @item.update_attributes!(sent_at: DateTime.now, is_refund: true)
      @item.refund!
    elsif !@item.sent? && params.has_key?(:approved)
      if (params['approved']) 
        @item.update_attributes!(approved_at: DateTime.now)
      else
        @item.update_attributes!(approved_at: nil)
      end
    end


    @include_person = true
    @include_person_email = true
    @include_address = true
    @include_mailing_address = true
    @include_yearly_cash_out_totals = true
    @include_account_owner = true

    render 'api/v2/cash_outs/show'
  end

end
