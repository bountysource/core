# == Schema Information
#
# Table name: team_invites
#
#  id         :integer          not null, primary key
#  team_id    :integer          not null
#  token      :string(255)      not null
#  email      :string(255)
#  admin      :boolean          default(FALSE), not null
#  developer  :boolean          default(FALSE), not null
#  public     :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_team_invites_on_email              (email)
#  index_team_invites_on_email_and_team_id  (email,team_id) UNIQUE
#  index_team_invites_on_team_id            (team_id)
#

class TeamInvite < ActiveRecord::Base
  attr_accessible :email, :token, :team, :admin, :developer, :public

  belongs_to :team

  validates :team, presence: true
  validates_uniqueness_of :email, scope: :team_id

  before_create do
    self.token = self.class.generate_token(team)
  end

  def self.generate_token(team)
    time = Time.now.to_i
    hash = create_token_hash(team.id, time)
    "#{team.id}.#{time}.#{hash}"
  end

  def self.token_valid?(token)
    team_id, time, hash = token.split(".") rescue false
    team = Team.where(id: team_id).first

    return false unless team
    return false unless hash == create_token_hash(team_id, time)

    # TODO expire tokens?
    # return false unless Time.at(time) > (Time.now - 3.days)

    true
  end

  # om nom nom. use this invite code to create person
  def accept!(person)
    transaction do
      # make sure the token is valid
      self.class.token_valid?(token) or raise ActiveRecord::Rollback

      # add person to the team
      team.add_member(person, admin: admin?, developer: developer?, public: public?)

      # destroy the invite
      self.destroy or raise ActiveRecord::Rollback
    end
  end

  # reject an invite. TODO does this need more validation?
  def reject!
    destroy
  end

  # create the frontend redemption URL for the recipient
  def url
    uri = URI.parse("#{Api::Application.config.www_url}teams/#{team.to_param}/join")
    uri.query = {
      token: token,
      admin: admin?,
      developer: developer?,
      public: public?
    }.to_param
    uri.to_s
  end

  # send invite to recipient
  def send_email(email=nil, attrs={})
    email ||= self.email
    message = Mailer.send(:invited_to_team, attrs.merge(email: email, invite: self))
    message.deliver
  end

protected

  def self.create_token_hash(team_id, time)
    Digest::MD5.hexdigest("#{team_id}.#{time}.#{Api::Application.config.team_invite_secret}")
  end
end
