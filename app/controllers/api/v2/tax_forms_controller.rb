class Api::V2::TaxFormsController < Api::BaseController
  before_filter :require_auth

  def index
    render json: {
      yearly_income: current_user.yearly_cash_out_totals, 
      tax_form_complete: current_user.tax_form.present? ,
      tax_form_approved: current_user.tax_form.present? && current_user.tax_form.approved,
      tax_form_checked: current_user.tax_form.present? && current_user.tax_form.checked
    }
  end

  def create
    form_data = TaxForm.validator(params[:form_type], request.request_parameters.except(:tax_form, :requester))
    
    if form_data.valid?
      item = TaxForm.build(current_user, form_data)
      render json: {success: true, item: item}
    else
      render json: {success: false, vals: form_data.as_json, errors: form_data.errors}
    end
  end

end