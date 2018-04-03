class Api::V0::ReportController < Api::V0::BaseController
  def accounts
    date = params.has_key?(:date) ? Time.parse(params[:date]).beginning_of_day : Time.now.beginning_of_day
    render json: Account.balance_report(date)
  end

  def account_balance
    require_params :account

    account = params[:account].constantize.instance
    date = params.has_key?(:date) ? DateTime.parse(params[:date]) : DateTime.now

    if account.is_a?(Account::Paypal)
      date += 8.hours
    end

    render json: { balance: account.balance_at(date) }
  end

  def transactions
    require_params :start_date, :end_date

    account = params[:account].constantize.instance rescue nil

    start_date = DateTime.parse(params[:start_date]).beginning_of_day
    end_date = DateTime.parse(params[:end_date]).end_of_day

    if account.is_a?(Account::Paypal)
      start_date += 8.hours
      end_date += 8.hours
    end

    @transactions = Transaction.includes(:splits => [:account]).where(created_at: start_date..end_date)

    if account
      @transactions = @transactions.includes(:splits => [:account]).joins(:splits).where('splits.account_id = ?', account.id).uniq
    end
  end

  def all_account_balances
    require_params :start_date, :end_date

    start_date = Time.use_zone(Account.reporting_time_zone) { Time.zone.parse(params[:start_date]) }
    end_date = Time.use_zone(Account.reporting_time_zone) { Time.zone.parse(params[:end_date]) + 1.day }

    render json: Account.account_type_balances_by_start_and_end(start_date, end_date)
  end

  def paypal
    require_params :start_date, :end_date

    Time.use_zone(Account::Paypal.reporting_time_zone) do
      start_date = Time.zone.parse(params[:start_date]).beginning_of_day
      end_date = Time.zone.parse(params[:end_date]).beginning_of_day
      date_range = start_date...end_date

      @start_balance = Account::Paypal.balance_at(start_date)
      @end_balance = Account::Paypal.balance_at(end_date)
      @start_liability = Account.liability_at(start_date)
      @end_liability = Account.liability_at(end_date)

      @bounty_sales = Transaction::Order::Paypal.where(created_at: date_range).bounty_sales
      @pledge_sales = Transaction::Order::Paypal.where(created_at: date_range).pledge_sales
      @merch_sales = Transaction::Order::Paypal.where(created_at: date_range).merch_sales
      @team_sales = Transaction::Order::Paypal.where(created_at: date_range).team_sales

      @bounty_liability = Transaction::Order::Paypal.where(created_at: date_range).bounty_liability
      @pledge_liability = Transaction::Order::Paypal.where(created_at: date_range).pledge_liability
      @team_liability = Transaction::Order::Paypal.where(created_at: date_range).team_liability
      @cash_out_liability = Transaction::CashOut::Paypal.where(created_at: date_range).liability
      @refund_liability = Transaction::Refund::Paypal.where(created_at: date_range).liability
      @tracker_liability = Account::Repository.liability(date_range)

      @processing_fees = Transaction::Order::Paypal.where(created_at: date_range).processing_fees
      @refunded_fees = Transaction::Refund::Paypal.where(created_at: date_range).processing_fees
      @refunds = Transaction::Refund::Paypal.where(created_at: date_range).sales
      @transfers = Account::Paypal.transfers(date_range)
      @cash_outs = Transaction::CashOut::Paypal.where(created_at: date_range).sales

      render 'api/v0/report/escrow_report'
    end
  end

  def google_wallet
    require_params :start_date, :end_date

    Time.use_zone(Account::GoogleWallet.reporting_time_zone) do
      start_date = Time.zone.parse(params[:start_date]).beginning_of_day
      end_date = Time.zone.parse(params[:end_date]).beginning_of_day
      date_range = start_date..end_date

      @start_balance = Account::GoogleWallet.balance_at(start_date)
      @end_balance = Account::GoogleWallet.balance_at(end_date)

      @bounty_sales = Transaction::Order::GoogleWallet.where(created_at: date_range).bounty_sales
      @pledge_sales = Transaction::Order::GoogleWallet.where(created_at: date_range).pledge_sales
      @merch_sales = Transaction::Order::GoogleWallet.where(created_at: date_range).merch_sales
      @team_sales = Transaction::Order::GoogleWallet.where(created_at: date_range).team_sales

      @bounty_liability = Transaction::Order::GoogleWallet.where(created_at: date_range).bounty_liability
      @pledge_liability = Transaction::Order::GoogleWallet.where(created_at: date_range).pledge_liability
      @team_liability = Transaction::Order::GoogleWallet.where(created_at: date_range).team_liability
      @cash_out_liability = Transaction::CashOut::GoogleWallet.where(created_at: date_range).liability
      @refund_liability = Transaction::Refund::GoogleWallet.where(created_at: date_range).liability
      @tracker_liability = 0.0

      @processing_fees = Transaction::Order::GoogleWallet.where(created_at: date_range).processing_fees
      @refunded_fees = Transaction::Refund::GoogleWallet.where(created_at: date_range).processing_fees
      @refunds = Transaction::Refund::GoogleWallet.where(created_at: date_range).sales
      @transfers = Account::GoogleWallet.transfers(date_range)
      @cash_outs = Transaction::CashOut::GoogleWallet.where(created_at: date_range).sales

      render 'api/v0/report/escrow_report'
    end
  end

  def bank_of_america
    require_params :start_date, :end_date

    Time.use_zone(Account::BofA.reporting_time_zone) do
      start_date = Time.zone.parse(params[:start_date]).beginning_of_day
      end_date = Time.zone.parse(params[:end_date]).beginning_of_day
      date_range = start_date..end_date

      @start_balance = Account::BofA.balance_at(start_date)
      @end_balance = Account::BofA.balance_at(end_date)

      @bounty_sales = 0.0
      @pledge_sales = 0.0
      @merch_sales = 0.0
      @team_sales = 0.0

      @bounty_liability = 0.0
      @pledge_liability = 0.0
      @team_liability = 0.0
      @cash_out_liability = Transaction::CashOut::BankOfAmerica.where(created_at: date_range).liability
      @refund_liability = 0.0
      @tracker_liability = 0.0

      @processing_fees = 0.0
      @refunded_fees = 0.0
      @refunds = 0.0
      @transfers = Account::BofA.transfers(date_range)
      @cash_outs = Account::BofA.cash_outs(date_range)

      render 'api/v0/report/escrow_report'
    end
  end

  def internal
    require_params :start_date, :end_date

    start_date = Time.zone.parse(params[:start_date]).beginning_of_day
    end_date = Time.zone.parse(params[:end_date]).beginning_of_day
    date_range = start_date..end_date

    @start_balance = Account::BofA.balance_at(start_date)
    @end_balance = Account::BofA.balance_at(end_date)

    @bounty_sales = 0.0
    @pledge_sales = 0.0
    @merch_sales = 0.0
    @team_sales = 0.0

    @bounty_liability = 0.0
    @pledge_liability = 0.0
    @team_liability = 0.0
    @cash_out_liability = Transaction::CashOut::BankOfAmerica.where(created_at: date_range).liability
    @refund_liability = 0.0
    @tracker_liability = 0.0

    @processing_fees = 0.0
    @refunded_fees = 0.0
    @refunds = 0.0
    @transfers = Account::BofA.transfers(date_range)
    @cash_outs = Account::BofA.cash_outs(date_range)

    render 'api/v0/report/escrow_report'
  end

  def liability
    require_params :start_date, :end_date

    start_date = Time.parse(params[:start_date]).beginning_of_day
    end_date = Time.parse(params[:end_date]).beginning_of_day
    date_range = start_date..end_date

    @start_liability = Account.liability_at(start_date)
    @end_liability = Account.liability_at(start_date)

    render 'api/v0/report/liability_report'
  end
end
