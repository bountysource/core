# == Schema Information
#
# Table name: team_member_relations
#
#  id                   :integer          not null, primary key
#  team_id              :integer          not null
#  person_id            :integer
#  admin                :boolean          default(FALSE), not null
#  developer            :boolean          default(FALSE), not null
#  public               :boolean          default(TRUE), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  invited_by_person_id :integer
#  budget               :decimal(, )
#  balance              :decimal(, )
#  owner_type           :string(255)
#  owner_id             :integer
#  member               :boolean          default(TRUE), not null
#
# Indexes
#
#  index_team_member_relations_on_owner_id               (owner_id)
#  index_team_member_relations_on_owner_type             (owner_type)
#  index_team_member_relations_on_person_id              (person_id)
#  index_team_member_relations_on_person_id_and_team_id  (person_id,team_id) UNIQUE
#  index_team_member_relations_on_team_id                (team_id)
#

class TeamMemberRelation < ActiveRecord::Base

  attr_accessible :admin, :public, :developer, :person, :team, :inviter, :budget, :balance, :linked_account, :owner, :member

  belongs_to :team
  belongs_to :person
  belongs_to :inviter, class_name: 'Person', foreign_key: :invited_by_person_id
  belongs_to :owner, polymorphic: true

  validates_uniqueness_of :person_id, scope: [:team_id], allow_nil: true

  validates :budget, numericality: { greater_than: 0 }, allow_nil: true #don't allow negative budgets, add validation to only create budget for developer: true
  validate :validate_developer_budget

  scope :members_only, lambda { where(member: true) }

  def set_budget(budget_amount)
    if !budget_amount.nil?
      self.budget = budget_amount
      self.balance = budget_amount
    else
      # if the budget is set to 0, simply remove the budget contraint to give the developer access to the whole team budget
      self.delete_budget
    end
  end

  def delete_budget
    self.budget = nil
    self.balance = nil
  end

  def update_balance(order_gross)
    self.balance = self.balance - order_gross unless self.balance.nil?
    save
  end

  def has_budget?
    !self.budget.nil?
  end

protected

  def validate_developer_budget
    if !self.developer && !self.budget.nil?
      self.errors.add(:base, "only developers can have spending limits.")
    end
  end

end
