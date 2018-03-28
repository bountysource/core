class Api::V2::SupportLevelsController < Api::BaseController

  before_action :require_auth, except: [ :paypal_return, :global_summary ]
  before_action :require_support_level, only: [:show, :update, :destroy]

  def show
    render 'api/v2/support_levels/show'
  end

  def index
    if params[:supporters_for_team]
      team = Team.where(slug: params[:supporters_for_team]).first!
      raise "not allowed" unless team.person_is_admin?(current_user)
      @collection = SupportLevel.where(team: team).includes(:person, :owner, :reward)
      @disclude_team = true
      @disclude_payment_method = true
    else
      @collection = current_user.support_levels.includes(:payment_method, :reward)

      if params[:team_id]
        @collection = @collection.where(team: Team.where(id: params[:team_id]).first!)
      elsif params[:team_slug]
        @collection = @collection.where(team: Team.where(slug: params[:team_slug]).first!)
      end
    end

    render 'api/v2/support_levels/index'
  end

  # required parameters:
  # - amount
  # - team_id
  # - payment_method_id
  # optional parameters:
  # - display_as
  def create
    @item = SupportLevel.new
    create_or_update_support_level
  end

  def update
    raise "Can't modify a canceled support level" if @item.canceled?
    create_or_update_support_level
  end

  def destroy
    @item.cancel!
    render 'api/v2/support_levels/show'
  end

  def paypal_return
    if params[:token]
      # load info from temporary payment method
      temp_payment_method = PaymentMethodTemporary.where(paypal_token: params[:token]).first!
      current_user = temp_payment_method.person
      success_url = temp_payment_method.data['success_url']
      cancel_url = temp_payment_method.data['cancel_url']

      # destroy temp object since we've returned
      temp_payment_method.destroy

      # load item
      if temp_payment_method.data['support_level']['id']
        @item = current_user.support_levels.where(id: temp_payment_method.data['support_level']['id']).first!
      else
        @item = current_user.support_levels.build
      end

      # set attributes directly on support_level object
      temp_payment_method.data['support_level'].
        reject { |k,v| v.nil? }.
        each { |k,v| @item.send("#{k}=",v) }

      # convert token into contract
      contract_params = PaymentMethod::PaypalReferenceTransaction.convert_token_to_billing_agreement(params[:token])

      # if they accepted the billing agreement, create the payment method and support level objects
      if contract_params
        # save payment method to database
        @item.payment_method = PaymentMethod::PaypalReferenceTransaction.create!(
          person: current_user,
          data: contract_params
        )

        # create support lvel with new payment method
        @item.save!

        # send 'em to the final destination (allow for unknown :id)
        redirect_to success_url.gsub(/:id|%3Aid/, @item.id.to_s)
      else
        # send 'em to the final destination
        redirect_to cancel_url
      end
    else
      raise "NO TOKEN!"
    end
  end

  def global_summary
    render json: Team.global_salt_financial_summary
  end

protected

  def create_or_update_support_level
    # params passed into SupportLevel.create!
    @item.assign_attributes(
      person: current_user,
      team: Team.accepts_public_payins.where(id: params[:team_id]).first!,
      amount: params[:amount],
      owner: SupportLevel.owner_from_display_as(current_user, params[:display_as]),

      # always reset these so we can test to see if invoicing is needed
      status: 'pending',
      last_invoice_starts_at: nil,
      last_invoice_ends_at: nil
    )
    if params.has_key?(:reward_id) && params[:reward_id].to_i == 0
      @item.reward = nil
    elsif params.has_key?(:reward_id)
      team = @item.team
      support_offering = team.support_offering || team.create_support_offering

      # find the reward... if amount was passed in, enforce it
      query = support_offering.rewards.where(id: params[:reward_id])
      query = query.where("amount <= ?", @item.amount) if @item.amount
      @item.reward = query.first!

      # if amount wasn't passed in, set it to the reward
      @item.amount ||= @item.reward.amount
    end

    # we're expecting exactly 1 error on [:payment_method]... 2 or more means a problem
    unless @item.valid? || (@item.errors.count == 1 && @item.errors[:payment_method].any?)
      render json: { error: @item.errors.full_messages.reject { |e| e =~ /Payment method/ }.join(', ') }, status: :unprocessable_entity
      return
    end

    if params[:payment_method_id] == "paypal"
      token = PaymentMethod::PaypalReferenceTransaction.create_reference_token(
        return_url: File.join(Api::Application.config.api_url, "/support_levels/paypal_return")
      )

      # save params for return trip
      PaymentMethodTemporary.create(
        person: current_user,
        paypal_token: token,
        data: {
          support_level: @item.as_json,
          success_url: params[:success_url],
          cancel_url: params[:cancel_url]
        }
      )

      # redirect to paypal approval page
      @item = OpenStruct.new(redirect_to: PaymentMethod::PaypalReferenceTransaction.url_from_token(token))
      render 'api/v2/redirect'
    else
      if token = params[:payment_method_id].to_s.match(/^stripe:(.+)$/).try(:[],1)
        begin
          # find-or-create stripe customer
          if current_user.stripe_customer_id
            customer = Stripe::Customer.retrieve(current_user.stripe_customer_id)
          else
            customer = Stripe::Customer.create(
              email: current_user.email,
              description: current_user.full_name
            )
            current_user.update_attribute(:stripe_customer_id, customer.id)
          end

          # create stripe credit card
          card = customer.sources.create(:card => token)
          @item.payment_method = PaymentMethod::StripeCreditCard.create!(person: current_user, data: JSON.parse(card.to_json))
        rescue Stripe::StripeError => e
          render json: { error: ((e.json_body[:error][:message] rescue nil) || "There was an error processing your card.") }, status: :unprocessable_entity
          return
        end
      else
        # find existing payment method
        @item.payment_method = current_user.payment_methods.where(id: params[:payment_method_id]).first!
      end

      # create the support level and render the success
      @item.save!

      # optionally create a bountysource support level
      if params[:bountysource_team_amount].to_f > 0
        SupportLevel.create!(
          person: @item.person,
          team: Team.where(slug: 'bountysource').first!,
          amount: params[:bountysource_team_amount],
          owner: @item.owner,
          payment_method: @item.payment_method,
          status: 'pending',
          last_invoice_starts_at: nil,
          last_invoice_ends_at: nil
        )
      end

      # attempt to bill right away
      @item.payment_method.delay.create_and_settle_pending_invoices!

      render 'api/v2/support_levels/show'
    end

  end

  def require_support_level
    @item = current_user.support_levels.where(id: params[:id] || params[:id]).first!
  end

end
