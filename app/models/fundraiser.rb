# == Schema Information
#
# Table name: fundraisers
#
#  id                :integer          not null, primary key
#  person_id         :integer          not null
#  published         :boolean          default(FALSE), not null
#  title             :string(255)
#  homepage_url      :string(255)
#  repo_url          :string(255)
#  description       :text
#  about_me          :text
#  funding_goal      :integer          default(100)
#  published_at      :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  total_pledged     :decimal(10, 2)   default(0.0), not null
#  featured          :boolean          default(FALSE), not null
#  short_description :string(255)
#  days_open         :integer          default(30)
#  ends_at           :datetime
#  breached_at       :datetime
#  completed         :boolean          default(FALSE), not null
#  breached          :boolean          default(FALSE), not null
#  featured_at       :boolean
#  hidden            :boolean          default(FALSE), not null
#  cloudinary_id     :string(255)
#  team_id           :integer
#  tracker_id        :integer
#
# Indexes
#
#  index_fundraisers_on_breached     (breached)
#  index_fundraisers_on_completed    (completed)
#  index_fundraisers_on_ends_at      (ends_at)
#  index_fundraisers_on_featured     (featured)
#  index_fundraisers_on_featured_at  (featured_at)
#  index_fundraisers_on_hidden       (hidden)
#  index_fundraisers_on_person_id    (person_id)
#  index_fundraisers_on_published    (published)
#

class Fundraiser < ActiveRecord::Base
  has_cloudinary_image

  belongs_to :person
  belongs_to :team
  has_many :milestones
  has_many :rewards
  has_many :fundraiser_questions
  has_many :pledges
  has_many :trackers, through: :fundraiser_tracker_relations
  has_many :fundraiser_tracker_relations

  has_account class_name: 'Account::Fundraiser'

  validates :person,  presence: true
  validates :title,   presence: true

  validates :funding_goal, numericality: { greater_than: 0 }
  validates :short_description, length: { maximum: 140 }
  validates :days_open,
            unless: lambda { published? },
            numericality: {
              greater_than_or_equal_to: Proc.new { min_days_open },
              less_than_or_equal_to:    Proc.new { max_days_open },
              message: "must be between 14 and 30 days"
            }

  validates :funding_goal,      presence: true, if: lambda { published? }
  validates :description,       presence: true, if: lambda { published? }
  validates :short_description, presence: true, if: lambda { published? }
  validates :days_open,         presence: true, if: lambda { published? }
  validates :team_id,           presence: true

  # cannot edit funding goal of published fundraiser
  class FundraiserUpdateValidator < ActiveModel::Validator
    def validate(record)
      if record.published?
        record.errors.add :base, "Cannot change funding goal"   if record.funding_goal_changed?
        record.errors.add :base, "Cannot change duration"       if record.days_open_changed?
        record.errors.add :base, "You cannot have more than one active fundraiser at a time" if record.team.fundraisers.in_progress.count > 0 && record.published_was == false
      end
    end
  end
  validates_with FundraiserUpdateValidator, on: :update

  before_destroy do
    errors.add :base, "Cannot delete published fundraiser" if published?
    errors.empty?
  end

  # add a $0 reward model, so that we can track when backers choose to opt out of a reward
  after_create do
    # create as valid reward, then manually update amount to 0.... good enough.
    # save(validation: false) didn't want to play nicely in the controller action.
    zero_reward = rewards.create(amount: 1, description: "No reward")
    zero_reward.update_attribute :amount, 0
  end

  scope :draft,     lambda { where(published: false).order('updated_at desc') }
  scope :published, lambda { where(published: true).order('published_at desc') }
  scope :featured,  lambda { published.where(featured: true) }

  scope :in_progress, lambda { published.where('ends_at > :now', now: DateTime.now) }
  scope :ended,       lambda { published.where('ends_at <= :now', now: DateTime.now) }
  scope :completed,   lambda { published.where('total_pledged >= funding_goal') }

  class FundingGoalNotReached < StandardError; end

  def self.admin_search(query)
    where('id = :id OR title LIKE :q OR short_description LIKE :q', eq: query, q: "%#{query}%", id: query.to_i).uniq
  end

  # the minimum number of days that a fundraiser can be open for
  def self.min_days_open
    14
  end

  # the maximum number of days that a fundraiser can be open for
  def self.max_days_open
    30
  end

  # given a start date, returns the minimum end_by date
  def self.min_end_by_date(start_date=nil)
    ((start_date || DateTime.now) + self.min_days_open.days).beginning_of_day
  end

  # given a start date, returns the maximum end_by date
  def self.max_end_by_date(start_date=nil)
    ((start_date || DateTime.now) + self.max_days_open.days).end_of_day
  end

  def in_progress?
    published? && ends_at >= DateTime.now
  end

  # get days remaining. returns nil if not yet published
  def days_remaining
    if published?
      (ends_at.end_of_day.utc.to_date - DateTime.now.utc).to_i
    else
      days_open
    end
  end

  def to_s
    title
  end

  def to_param
    "#{id}-#{title.parameterize}"
  end

  def frontend_path
    if self.team
      "/teams/#{self.team.slug}/fundraiser"
    else
      "/fundraisers/#{to_param}"
    end
  end

  def frontend_url
    File.join(Api::Application.config.www_url, frontend_path)
  end

  def frontend_info_path
    "fundraisers/#{to_param}/rewards"
  end

  def frontend_info_url
    "#{Api::Application.config.www_url}#{frontend_info_path}"
  end

  def frontend_edit_path
    "fundraisers/#{to_param}/edit"
  end

  def frontend_edit_url
    "#{Api::Application.config.www_url}#{frontend_edit_path}"
  end

  def card_id
    "f#{id}"
  end

  def publishable?
    if published?
      false
    else
      temp_model = self.dup
      # #dup doesn't replicate date columns -- Manually add these back
      temp_model.created_at = self.created_at
      temp_model.updated_at = self.updated_at
      temp_model.published = true
      temp_model.valid?
    end
  end

  def publish!
    self.published    = true
    self.published_at = DateTime.now
    self.ends_at      = published_at.end_of_day + days_open.days
    save! if valid?
  end

  def description_to_html
    # we substitue tokens into the markdown, then run through Github::Markdown, and finally substitute tokens for escaped html to avoid double escaping
    markdown, tokens = convert_bountysource_markdown(description || '')
    html = GitHub::Markdown.render_gfm(markdown)
    tokens.each { |k,v| html = html.gsub(k,v) }
    html
  end

  def convert_bountysource_markdown(markdown)
    tokens = {}

    # issue tables:   @@ Title \n (issue_id | $goal)+
    running_total = 0.00
    new_markdown = markdown.gsub(/@@([\s\S]*?)(\n\n|\Z)/) do |match|
      token = SecureRandom.hex(12)
      local_total = 0.00

      begin
        issue_trs = ""
        lines = match.gsub("<br>","").split("\n").compact
        title = lines.shift.gsub(/@@ /,'')

        # extract @@ [options,from,the] title
        options = []
        title.gsub!(/^\[(.*?)\] */) do |match|
          options = $1.split(',')
          ''
        end
        options = options & %w(running_total total project participants thumbs)

        # extract issue ids and load issues
        issue_goals = lines.map do |line|
          issue_id, goal = line.split('|').map(&:strip)
          issue_id = issue_id.to_i
          goal = goal.gsub(/[^0-9.]/,'').to_f
          [issue_id, goal]
        end
        issue_map = Issue.where(id: issue_goals.map(&:first)).active.inject({}) { |hash,issue| hash[issue.id] = issue; hash }

        issue_goals.each do |issue_id, goal|
          if issue = issue_map[issue_id]
            issue_trs += (goal <= issue.bounty_total) ? %(<tr class="goal-met">) : %(<tr>)
            issue_trs += %(<td><a href="#{issue.tracker.frontend_url}" target="_blank">#{ActionController::Base.helpers.send(:html_escape, issue.tracker.name)}</a></td>) if options.include?('project')
            issue_trs += %(<td><a href="#{issue.frontend_url}" target="_blank">#{ActionController::Base.helpers.send(:html_escape, issue.title)}</a></td>)
            issue_trs += %(<td><span class="label label-success">#{ActionController::Base.helpers.number_to_currency(goal, precision: 0).gsub('$','$ ')}</span></td>)
            issue_trs += %(<td><a href="#{issue.frontend_url}" class="label label-warning" target="_blank"><i class="icon-thumbs-up icon-white"></i> #{issue.thumbs_up_count}</a></td>) if options.include?('thumbs')
            issue_trs += %(<td><a href="#{issue.frontend_url}" class="label label-important" target="_blank"><i class="icon-user icon-white"></i> #{issue.participants_count}</a></td>) if options.include?('participants')
            issue_trs += %(</tr>)

            local_total += goal
          end
        end

        running_total += local_total

        final_html = ''
        final_html += %(<h3>#{ActionController::Base.helpers.send(:html_escape, title)})
        final_html += %( (#{ActionController::Base.helpers.number_to_currency(running_total, precision: 0)})) if options.include?('running_total')
        final_html += %( (#{ActionController::Base.helpers.number_to_currency(local_total, precision: 0)})) if options.include?('total')
        final_html += %(</h3>)
        final_html += %(<table class='table table-condensed table-bordered table-fundraiser-issues'>)
        final_html += %(<tr>)
        final_html += %(<th>Project</th>) if options.include?('project')
        final_html += %(<th>Issue</th>)
        final_html += %(<th>Goal</th>)
        final_html += %(<th><i class="icon-thumbs-up"></i></th>) if options.include?('thumbs')
        final_html += %(<th><i class="icon-user"></i></th>) if options.include?('participants')
        final_html += %(</tr>)
        final_html += issue_trs
        final_html += %(</table>)
        tokens[token] = final_html.html_safe
      rescue
        tokens[token] = "<div class='alert alert-error'>Syntax Error</div>"
      end

      token + "\n"
    end
    [new_markdown, tokens]
  end

  def update_total_pledged
    total = 0

    if account.present?
      total = pledges.where('status != :s', s: Pledge::Status::REFUNDED).sum(:amount)
    end

    self.total_pledged = total
    save
  end

  # all of the people that have made pledges
  def backers
    Person.where(id: pledges.pluck(:person_id))
  end

  # pay out the entire account to the creator
  def payout!
    ActiveRecord::Base.transaction do
      # rollback if no pledges to payout
      raise ActiveRecord::Rollback if pledges.unpaid.empty?

      transaction = Transaction::InternalTransfer::FundraiserCashOut.create!(
        description: "Payout Fundraiser(#{id}): Account Balance: $#{account_balance}",
        audited: true
      )
      total = account_balance
      transaction.splits.create!(amount: -total, item: self)
      transaction.splits.create!(amount: total, item: person)

      # update all of the pledges with rewards that have a merch fee, so that we do not charge twice for merchandise
      # if/when paid out again when it closes.
      pledges.unpaid.update_all status: Pledge::Status::PAID
    end
  end

  def funded?(modifier=1)
    published? && total_pledged >= (funding_goal * modifier)
  end

  def send_email_if_featured
    if featured_changed? && featured_was == false && featured
      send_fundraiser_featured_notification
    end
  end

  # get the reward model representing the backer opting out of a reward.
  # should be created in Fundraiser after_create callback
  def zero_reward
    rewards.find_by_amount(0)
  end

  # payout all fundraiser that have completed and are eligible for payout.
  # update the completed flag, so that they aren't picked up again by the cronjob
  # Note: it now pays out fundraisers that have NOT met their goal after
  # the end_date, aka flex funding.
  def self.payout_completed!
    where('completed = ? AND ends_at <= ?', false, DateTime.now).find_each do |fundraiser|
      # email backers with post-complete info about fundraiser
      fundraiser.backers.each { |backer| backer.send_email :fundraiser_completed, fundraiser: fundraiser }

      # queue payout
      fundraiser.delay.payout!

      # update completed flag for the fundraiser
      fundraiser.update_attribute :completed, true
    end
  end

  # TODO remove this, user #feature! instead
  def send_fundraiser_featured_notification
    person.send_email :fundraiser_featured_notification, fundraiser: self
  end

  def feature!
    unless featured?
      self.class.transaction do
        self.featured = true
        self.featured_at = DateTime.now

        save or raise ActiveRecord::Rollback

        person.send_email :fundraiser_featured_notification, fundraiser: self
      end
    end
  end

  def unfeature!
    if featured?
      self.update_attribute :featured, false
    end
  end

  # check to see if half funded, or 100% funded.
  # this only works if it is invoked after every Pledge create
  def check_for_breach
    return nil if pledges.empty? || breached?

    funding_goal_breached       = funded?       && (total_pledged - pledges.last.amount) < funding_goal
    half_funding_goal_breached  = funded?(0.50) && (total_pledged - pledges.last.amount) < (funding_goal / 2)

    # return if there is nothing to do
    return nil unless funding_goal_breached || half_funding_goal_breached

    # it was breached!
    if funding_goal_breached
      update_attributes breached: true, breached_at: DateTime.now

      # email the fundraiser creator
      person.send_email :notify_creator_of_fundraiser_breached, fundraiser: self

      # email all of the backers
      backers.map { |b| b.send_email :notify_backers_of_fundraiser_breached, fundraiser: self }

      # send survey emails to backers that selected a reward which requires more info
      rewards.find_each do |reward|
        reward.pledges.joins(:reward).each(&:send_survey_email) if reward.fulfillment_details?
      end

      # last but not least... pay the creator!
      payout!
    end

    # half way there, and it wasn't just breached
    if half_funding_goal_breached && !funding_goal_breached
      # email the fundraiser creator
      person.send_email :notify_creator_of_fundraiser_half_completion, fundraiser: self

      # email all of the backers
      backers.map { |b| b.send_email :notify_backers_of_fundraiser_half_completion, fundraiser: self }
    end
  end

  # oh no, the fundraiser failed! use this method to refund all of the backers
  # TODO emails or something
  def refund_backers!
    self.class.transaction do
      Transaction.build do |tr|
        tr.description = "Refund Fundraiser(#{id}) #{pledges_count} Pledges - Total Pledges: $#{total_pledged} Account Balance: $#{account_balance}"

        # remove all money from the fundraiser account
        tr.splits.create(amount: -account_balance, item: self)

        # for each pledge, add a split adding money to person accounts
        pledges.find_each do |pledge|
          # get the amount to refund (pledge split where account is this fundraiser)
          if (split = pledge.splits.find_by_account_id(account.id))
            tr.splits.create(amount: split.amount, item: pledge.person)
          end
        end
      end
    end
  end

  def pledges_count
    pledges.loaded? ? pledges.length : pledges.count
  end

  def top_backers(number = nil)
    pledges.includes(:person, :owner).select('owner_id, owner_type, person_id, sum(amount) as amount, anonymous, min(created_at) as created_at').group('person_id, owner_id, owner_type, anonymous').order('sum(amount) desc').limit(number).to_a
  end

end
