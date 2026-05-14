# == Schema Information
#
# Table name: reports
#
#  id           :integer          not null, primary key
#  reporter_id  :integer          not null
#  target_type  :string           not null
#  target_id    :integer          not null
#  reason       :string           not null, default('spam')
#  description  :text
#  status       :string           not null, default('open')
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
class Report < ApplicationRecord
  VALID_TARGET_TYPES = %w[Issue Comment Bounty Fundraiser Team Person].freeze
  VALID_REASONS = %w[spam harassment inappropriate duplicate other].freeze
  VALID_STATUSES = %w[open reviewed resolved dismissed].freeze

  belongs_to :reporter, class_name: 'Person'

  validates :target_type, presence: true, inclusion: { in: VALID_TARGET_TYPES }
  validates :target_id, presence: true
  validates :reason, presence: true, inclusion: { in: VALID_REASONS }
  validates :status, inclusion: { in: VALID_STATUSES }
  validates :reporter_id, uniqueness: { scope: [:target_type, :target_id], message: 'has already reported this item' }

  scope :open, -> { where(status: 'open') }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_status, ->(status) { where(status: status) if status.present? }

  has_paper_trail

  def target
    target_type.constantize.find_by(id: target_id)
  end

  def open?
    status == 'open'
  end

  def resolved?
    status.in?(%w[resolved dismissed])
  end
end
