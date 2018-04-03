class Api::V2::PeopleController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::PeopleHelper

  before_action :require_auth, only: [ :update ]

  def index
    @collection = ::Person.active

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
  end

  def update
    raise "ID doesnt match" unless params[:id].to_i == current_user.id

    if params[:unlink_account] == 'facebook' && current_user.facebook_account
      current_user.facebook_account.destroy!
    elsif params[:unlink_account] == 'twitter' && current_user.twitter_account
      current_user.twitter_account.destroy!
    elsif params[:unlink_account] == 'github' && current_user.github_account
      current_user.github_account.unlink_account_from_person!
    end

    if params[:bounty_hunter_opt_in_team]
      team = Team.where(slug: params[:bounty_hunter_opt_in_team]).first!
      current_user.is_bounty_hunter!(team: team)
    end

    if params[:bounty_hunter_opt_out_team]
      team = Team.where(slug: params[:bounty_hunter_opt_out_team]).first!
      current_user.is_not_bounty_hunter!(team: team)
    end

    render json: true
  end

  def me
    if @item = current_user
      render 'api/v2/people/me'
    else
      render json: {}
    end
  end

  def unsubscribe
    # allow no-signature unsubscribes for another month
    recipient = Unsubscribe.token_to_object(params[:recipient])
    categories = [params[:categories]].flatten.compact.join(',').split(',').uniq.sort
    raise "Recipient or list missing" if !recipient || categories.empty?

    if recipient.is_a?(Person)
      params = { person: recipient }
    elsif recipient.is_a?(LinkedAccount::Base)
      params = { linked_account: recipient }
    elsif recipient.is_a?(String)
      params = { email: recipient }
    end

    categories.each { |category| Unsubscribe.create!(params.merge(category: category)) }
    render json: { success: true }
  end

end
