# == Schema Information
#
# Table name: pledges
#
#  id              :integer          not null, primary key
#  fundraiser_id   :integer
#  person_id       :integer
#  amount          :decimal(10, 2)   not null
#  status          :string(12)       default("active")
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  reward_id       :integer
#  survey_response :text
#  anonymous       :boolean          default(FALSE), not null
#  owner_type      :string(255)
#  owner_id        :integer
#
# Indexes
#
#  index_pledges_on_anonymous   (anonymous)
#  index_pledges_on_owner_id    (owner_id)
#  index_pledges_on_owner_type  (owner_type)
#  index_pledges_on_status      (status)
#

class Pledge < ActiveRecord::Base

  attr_accessible :amount, :person, :status, :reward, :reward_id, :survey_response, :anonymous, :fundraiser, :owner_id,
    :owner_type, :fundraiser_id

  belongs_to :fundraiser
  belongs_to :person
  belongs_to :reward

  # TODO: this object shouldn't have an account... rework Transaction.build to use "account: pledge.fundraiser"
  has_one :account, :through => :fundraiser
  has_one :team, :through => :fundraiser
  has_many :splits, :as => :item
  has_many :txns, :through => :splits

  # Helper defined in config/initializers/has_owner.rb
  # Gives access to polymorphic owner, which respects object anonymity on read
  has_owner

  validates :amount, numericality: { presence: true, greater_than_or_equal_to: 5 }
  validates :fundraiser, presence: true
  validate :validate_reward

  # define status constants
  module Status
    ACTIVE = 'active'
    REFUNDED = 'refunded'
    PAID = 'paid'

    def self.all
      [ACTIVE, REFUNDED, PAID]
    end
  end

  validates :status, inclusion: { in: Status.all }

  scope :merchandise, lambda { joins(:reward).merge(Reward.merchandise) }
  scope :active,      lambda { where("pledges.status != :refunded", refunded: Status::REFUNDED) }
  scope :refunded,    lambda { where(status: Status::REFUNDED) }
  scope :not_refunded, lambda { where("status != :status", status: Status::REFUNDED) }
  scope :paid,        lambda { where(status: Status::PAID) }
  scope :unpaid,      lambda { where('status != :s', s: Status::PAID) }
  scope :visible,     lambda { where("anonymous = false AND status != :status", status: Status::REFUNDED) }
  scope :created_this_month, lambda { |period=Time.now| active.where(created_at: period.beginning_of_month..period.end_of_month) }

  # if reward id is nil, set reward as the Fundraiser.zero_reward
  before_create do
    self.reward_id = fundraiser.zero_reward.id unless reward_id
    self.owner ||= self.person

    # Temp hack: pull survey response from table
    if (!self.survey_response && pledge_survey_response = PledgeSurveyResponse.where(reward_id: self.reward_id, person_id: self.person_id).first)
      self.survey_response = pledge_survey_response.survey_response
      pledge_survey_response.destroy
    end
  end

  after_commit do
    team.update_financial_cache_counters

    team_ids = []
    team_ids << owner_id if owner_type == 'Team'
    team_ids << previous_changes[:owner_id] if previous_changes[:owner_id] && (previous_changes[:owner_type] || owner_type) == 'Team'
    team_ids << fundraiser.team_id
    Team.where(id: team_ids.compact.uniq).each(&:update_activity_total)
  end

  validate do
    if !new_record? && anonymous_changed? && !can_make_anonymous?
      errors.add(:anonymous, "cannot be changed")
    end
  end

  def validate_reward
    if reward
      if amount < reward.amount
        errors[:base] << "Insufficient pledge amount for reward"
      elsif reward.sold_out?
        errors[:base] << "Reward no longer available"
      end
    end
  end

  def display_amount
    Money.new(amount*100, 'USD').display_amount
  end

  def item_name
    fundraiser.title
  end

  def send_survey_email
    if reward && reward.fulfillment_details?
      person.send_email :pledge_survey_email, fundraiser: fundraiser, reward: reward, pledge: self
    end
  end

  def frontend_path
    "/fundraisers/#{fundraiser.to_param}/pledges/#{id}"
  end

  def frontend_url
    File.join(Api::Application.config.www_url, frontend_path)
  end

  def create_account
    fundraiser.create_account
  end

  def build_account
    fundraiser.build_account
  end

  def claim_reward
    # claim the reward, decrementing the quantity
    reward.claim! if reward

    # new relic analytics for Pledge create
    new_relic_data_point "Custom/Fundraiser/pay_in", amount.to_f

    # send receipt email
    person.send_email :fundraiser_pledge_made, pledge: self

    # notify the creator
    # if the pledge is anonymous, mask the backer
    fundraiser.person.send_email :fundraiser_backed, pledge: self
  end

  def active?
    status == Status::ACTIVE
  end

  def paid?
    status == Status::PAID
  end

  def refunded?
    status == Status::REFUNDED
  end

  # TODO move to has_owner.rb ?
  def can_make_anonymous?
    owner && owner.is_a?(Person)
  end

  # After purchase callback
  def after_purchase(order)
    delay.claim_reward

    MixpanelEvent.track(
      person_id: person_id,
      event: 'Create Order',
      checkout_method: order.checkout_method.class.name,
      product: "pledge",
      amount: amount,
      reward_id: reward.id,
      fundraiser_id: fundraiser_id
    )

    # moved this check to Fundraiser
    fundraiser.delay.check_for_breach

    fundraiser.update_total_pledged
  end

end
