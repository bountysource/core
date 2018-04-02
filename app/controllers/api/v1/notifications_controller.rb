class Api::V1::NotificationsController < ApplicationController

  before_action :require_auth

  def friends
    # get the ids of all of your friends to speed up queries
    friends     = @person.friends.to_a
    friend_ids  = friends.map(&:id)

    # get recent pledges by your friends. defaults to 1 day again
    bounties = Bounty.includes(:issue => [:author, :tracker => :languages], :person => :github_account)
    .where('people.id IN (:friends_ids)', friends_ids: friend_ids)
    .order('created_at desc')
    .limit(15)

    pledges = Pledge.includes(:reward, :fundraiser, :person => :github_account)
    .where('fundraisers.published = ? AND people.id IN (?)', true, friend_ids)
    .includes()
    .order('created_at desc')
    .limit(15)

    fundraisers = Fundraiser.includes(:rewards, :pledges => [:reward, :person => :github_account], :person => :github_account)
    .published
    .where('people.id IN (:friends_ids)', friends_ids: friend_ids)
    .order('created_at desc')
    .limit(15)

    # sort all notifications by created date, mixing them together
    combined_objects = (bounties + pledges + fundraisers).sort { |a,b| b.created_at <=> a.created_at }.first(30)


    # build notifications JSON
    notifications = combined_objects.map do |object|
      case object
      when Bounty     then render_rabl_template(object, "api/v1/notifications/partials/bounty")
      when Pledge     then render_rabl_template(object, "api/v1/notifications/partials/pledge")
      when Fundraiser then render_rabl_template(object, "api/v1/notifications/partials/fundraiser")
      end.merge!(type: object.class.name.underscore)
    end

    render json: notifications
  end

end
