class Api::V0::Accounts::PersonalController < Api::V0::AccountsController

  before_filter :require_person

  def gift
    require_params :amount

    if (@transaction = Transaction::InternalTransfer::Promotional.gift_to_with_amount @person, params[:amount].to_f)
      render "api/v1/transactions/show"
    else
      render json: { error: 'Unable to create transaction' }, status: :bad_request
    end
  end

protected

  def require_person
    unless (@person = Person.find_by_id params[:id])
      render json: { error: 'Person not found' }, status: :not_found
    end
  end
end
