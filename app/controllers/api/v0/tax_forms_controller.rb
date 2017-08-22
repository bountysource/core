require 'base64'

class Api::V0::TaxFormsController < Api::V0::BaseController
  before_filter :require_admin

  def show
    item = TaxForm.find(params[:id])
    begin
      render json: {success: true, pdf: Base64.strict_encode64(item.read_backup)}
    rescue Exception => e
      render json: {success: false, error: "File not found"}
    end
  end

  def approve
    @item = TaxForm.find(params[:id])
    if @item.approve(params[:approved].to_bool, params[:reason])
      render 'api/v2/tax_form/approve'
    else
      render json: {success: false, approved: item.approved }
    end
  end
end
