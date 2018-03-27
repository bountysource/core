# == Schema Information
#
# Table name: support_levels
#
#  id                     :integer          not null, primary key
#  person_id              :integer          not null
#  team_id                :integer          not null
#  amount                 :decimal(10, 2)   not null
#  status                 :string(255)      not null
#  owner_type             :string(255)
#  owner_id               :integer
#  payment_method_id      :integer          not null
#  created_at             :datetime
#  updated_at             :datetime
#  reward_id              :integer
#  last_invoice_starts_at :date
#  last_invoice_ends_at   :date
#  canceled_at            :datetime
#
# Indexes
#
#  index_support_levels_on_person_id  (person_id)
#  index_support_levels_on_reward_id  (reward_id)
#  index_support_levels_on_team_id    (team_id)
#

class SupportLevel < ActiveRecord::Base
  belongs_to :person
  belongs_to :team
  belongs_to :payment_method
  belongs_to :owner, polymorphic: true
  belongs_to :reward, class_name: 'SupportOfferingReward'

  has_many :payments, class_name: 'SupportLevelPayment'

  has_paper_trail

  # active -- current
  # pending -- billing hasn't happened yet
  # unpaid -- billing attempt failed
  # canceled -- explicitly canceled by user
  validates :status, inclusion: { in: %w(active pending canceled unpaid) }

  validates :person, presence: true
  validates :team, presence: true
  validates :payment_method, presence: true
  validates :amount, numericality: { greater_than_or_equal_to: 1.00, less_than_or_equal_to: 10000 }

  scope :active, lambda { where(status: %w(active pending)).where("exists(select id from teams where accepts_public_payins=true and id=support_levels.team_id)") }
  scope :unpaid, lambda { where(status: 'unpaid') }
  scope :canceled, lambda { where(status: 'canceled') }
  scope :needs_to_be_invoiced, lambda { |invoicing_period=nil|
    invoicing_period ||= PaymentMethod.default_invoicing_period
    active.where("(last_invoice_ends_at is null and created_at <= ?) or (last_invoice_ends_at < ?)", invoicing_period[:older_than], invoicing_period[:last_month_ends_on])
  }
  scope :grouped_supporter_amounts, lambda { |team|
    SupportLevel.
    where(team_id: team.id).
    active.
    select('owner_id, owner_type, sum(amount) as amount, min(created_at) as created_at').
    group("owner_id, owner_type, COALESCE(NULLIF(owner_type||owner_id,''), 'Person'||person_id)").
    order('amount desc, created_at')
  }

  after_commit :update_cache_counters

  def self.owner_from_display_as(person, display_as)
    if display_as == 'me'
      person
    elsif display_as && (team_id = display_as.match(/^team(\d+)$/).try(:[], 1))
      person.teams.where(id: team_id).first
    end
  end

  def update_cache_counters
    team.update_financial_cache_counters
    reward.update_counter! if reward
  end

  def cancel!
    update_attributes!(canceled_at: Time.now, status: 'canceled')
  end

  def canceled?
    canceled_at && (status == 'canceled')
  end

end
