class Api::V0::TransactionsController < Api::V0::BaseController

  before_action :require_transaction, only: [:show, :update, :destroy]
  before_action :find_start_date, only: [:index]
  before_action :find_end_date, only: [:index]

  def index
    @transactions = Transaction.includes(:splits => [:account]).order('transactions.created_at desc')

    if params[:unaudited]
      @transactions = @transactions.where('transactions.audited is null or transactions.audited = ?', false)
    end

    if @start_date && @end_date
      @transactions = @transactions.where(created_at: @start_date..@end_date)
    end

    if params.has_key?(:account)
      account = params[:account].constantize.instance
      @transactions = @transactions.joins(:splits).where('splits.account_id = ?', account.id).uniq
    end
  end

  def show
  end

  def create
    @transaction = Transaction.new
    update
  end

  def update
    require_params :description

    errors = []

    # basic fields
    @transaction.description = params[:description]
    @transaction.created_at = Time.parse(params[:created_at]) rescue nil if params[:created_at]
    @transaction.audited = !params[:audited].blank?

    @transaction.gross = params[:gross] if params.has_key?(:gross)
    @transaction.fee = params[:fee] if params.has_key?(:fee)
    @transaction.processing_fee = params[:processing_fee] if params.has_key?(:processing_fee)
    @transaction.liability = params[:liability] if params.has_key?(:liability)

    if params.has_key?(:type) && (params[:type].constantize rescue false)
      @transaction.type = params[:type]
    end

    # splits
    splits_before = splits_after = []
    if params[:splits]
      # balanced?? Money == cents not dollars
      split_sum = params[:splits].values.map { |h| Money.new(h['amount'].to_f*100) }.sum.to_f
      errors << "Transaction not balanced, off by: #{split_sum}" unless split_sum == 0

      # splits
      splits_before = @transaction.splits.to_a
      params[:splits].values.map(&:with_indifferent_access).each do |split_hash|
        if split_hash[:id]
          split = splits_before.find { |split| split.id == split_hash[:id].to_i }
          splits_after << split
        else
          split = @transaction.splits.build
          split.txn = @transaction
          splits_after << split
        end

        if split_hash[:account_id]
          split.account = Account.find(split_hash[:account_id])
        elsif split_hash[:item_id] && split_hash[:item_type]
          split.item = find_item(split_hash[:item_id], split_hash[:item_type])
        end

        if split_hash[:item_id].blank? && split_hash[:item_type].blank?
          split.item_id = nil
          split.item_type = nil
        elsif item = find_item(split_hash[:item_id], split_hash[:item_type])
          split.item_id = split_hash[:item_id]
          split.item_type = split_hash[:item_type]
        else
          errors << "Item not found (#{split_hash[:item_type]}, #{split_hash[:item_id]})"
        end

        split.amount = split_hash[:amount]
      end
    end

    @transaction.valid?
    splits_after.map(&:valid?)
    errors += @transaction.errors.full_messages
    errors += splits_after.map { |d| d.errors.full_messages }.flatten

    if errors.empty?
      @transaction.save!
      splits_after.each { |s| s.created_at = @transaction.created_at }
      splits_after.map(&:save!)
      (splits_before - splits_after).map(&:destroy)

      render "api/v1/transactions/show"
    else
      render json: { error: errors.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @transaction.splits.destroy_all
    @transaction.delete
    head :no_content
  end

  def sweep
    Time.use_zone(Account.reporting_time_zone) do
      timestamp = Time.zone.parse(params[:sweep_date]).beginning_of_day
      @transaction = Transaction::InternalTransfer::RevenueRecognition.create_transaction_as_of(timestamp)
      if @transaction
        render "api/v1/transactions/show"
      else
        head :no_content
      end
    end
  end

protected

  # find polymorphic item from id and type
  def find_item(item_id, item_type)
    if item_id && item_type
      # camelize dat case, homie
      item_type = item_type.camelize

      # make sure it's actually a class
      if (item_class = item_type.constantize rescue nil)
        item_class.find_by_id item_id
      end
    end
  end

  def require_transaction
    unless (@transaction = Transaction.find_by_id params[:id])
      render(json: { error: "Transaction not found" }, status: :not_found)
    end
  end

  def find_start_date
    if params.has_key?(:start_date)
      @start_date = DateTime.parse(params[:start_date])
    end
  end

  def find_end_date
    if params.has_key?(:end_date)
      @end_date = DateTime.parse(params[:end_date])
    end
  end
end
