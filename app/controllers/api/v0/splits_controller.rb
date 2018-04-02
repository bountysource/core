class Api::V0::SplitsController < Api::V0::BaseController
  def index
    require_params :start_date, :end_date, :account_id

    account = Account.find(params[:account_id])

    Time.use_zone(account.class.reporting_time_zone) do
      start_date = Time.zone.parse(params[:start_date]).beginning_of_day
      end_date = Time.zone.parse(params[:end_date]).beginning_of_day
      date_range = start_date...end_date

      @splits = Split.includes(:txn).where(created_at: date_range, account_id: account.id).uniq

      render "api/v0/splits/index"
    end
  end
end
