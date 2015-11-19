# == Schema Information
#
# Table name: team_updates
#
#  id            :integer          not null, primary key
#  number        :integer
#  title         :string(255)
#  body          :text
#  published     :boolean          default(FALSE), not null
#  published_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  team_id       :integer          not null
#  mailing_lists :json
#
# Indexes
#
#  index_team_updates_on_published           (published)
#  index_team_updates_on_team_id_and_number  (team_id,number) UNIQUE
#

class TeamUpdate < ActiveRecord::Base
  attr_accessible :title, :body, :team, :number, :mailing_lists

  belongs_to :team

  validates :team,  presence: true
  #validates :number,      presence: true
  validates :title,       presence: true
  validates :body,        presence: true

  default_scope lambda { order("team_updates.number desc") }
  scope :published, lambda { where(published: true).order('published_at desc') }
  scope :draft,     lambda { where(published: false).order('updated_at desc') }

  # doesn't take into account unsubscribes, email blacklists, or missing github emails
  def self.distribution_lists_for_team(team)
    # build these up
    people_ids = []
    linked_account_ids = []

    # trackers owned by the team
    tracker_ids = team.owned_trackers.not_deleted.pluck(:id)

    # bounty hunters
    people_ids += team.team_bounty_hunters.active.pluck(:person_id)

    # team contributions
    people_ids += team.payins.pluck(:person_id)

    # salt subscriptions
    people_ids += team.support_levels.active.pluck(:person_id)

    # fundraiser pledges
    fundraiser_ids = Fundraiser.where(team_id: team.id).pluck(:id)
    people_ids += Pledge.where(fundraiser_id: fundraiser_ids).pluck(:person_id)

    # bounties
    issue_ids = Issue.where(tracker_id: tracker_ids).pluck(:id)
    people_ids += Bounty.where(issue_id: issue_ids).pluck(:person_id)

    # github users on bountysource
    people_ids += GithubStargazer.where(tracker_id: tracker_ids).joins(:linked_account).where.not('linked_accounts.person_id' => nil).pluck('linked_accounts.person_id')

    # github users not on bountysource
    linked_account_ids += GithubStargazer.where(tracker_id: tracker_ids).joins(:linked_account).where('linked_accounts.person_id' => nil).pluck('linked_accounts.id')

    # return value
    {
      people_ids: people_ids.uniq,
      linked_account_ids: linked_account_ids.uniq
    }
  end

  def to_param
    "#{number}-#{title.parameterize}"
  end

  def body_html
    return "" if body.blank?
    html = GitHub::Markdown.render(body)
    html = html.gsub(/<!--SALT_BUTTON-->/,'<a href="https://salt.bountysource.com/teams/'+team.slug+'" target="_blank" style="padding:10px 16px;font-size:18px;line-height:1.33;border-radius:6px;color:#fff;background-color:#5cb85c;border-color:#4cae4c;text-decoration:none">Support '+team.name+'</a>')
    return html
  end

  def body_truncated
    text = body_html
    text = ActionController::Base.helpers.strip_tags(text)
    text = HTMLEntities.new.decode(text)
    text = ActionController::Base.helpers.truncate(text, length: 250, escape: false)
  end

  def next_number
    (team.updates.maximum(:number) || 0) + 1
  end

  def publish!(options={})
    return if published?

    self.class.transaction do
      self.number = next_number
      self.published    = true
      self.published_at = DateTime.now

      if save
        delay.send_all_emails(oauth_token: options[:oauth_token])
      end
    end

    valid?
  end

  def send_test_email(options)
    send_one_email(options.merge(is_draft: true))
  end

  def send_bountysource_newsletter
    raise "bountysource only" unless team.slug == 'bountysource' && self.published
    Person.active.find_each do |person|
      delay(priority: 151).send_one_email(person_id: person.id)
    end
  end

protected

  # you probably want to call this delayed
  def send_one_email(options)
    mailer_options = {}
    mailer_options[:update] = self
    mailer_options[:is_draft] = true if options[:is_draft]

    # optionally turn IDs into objects
    if options[:person]
      mailer_options[:person] = options[:person]
    elsif options[:person_id]
      mailer_options[:person] = Person.active.where(id: options[:person_id]).first
    elsif options[:linked_account]
      mailer_options[:linked_account] = options[:linked_account]
    elsif options[:linked_account_id]
      mailer_options[:linked_account] = LinkedAccount::Github::User.find(options[:linked_account_id])
    end

    if mailer_options[:person]
      mailer_options[:person].deliver_email(:team_update_created, mailer_options)
    elsif mailer_options[:linked_account]
      # sync with github to get latest email address
      mailer_options[:linked_account].sync_basic_data(oauth_token: options[:oauth_token])
      return if mailer_options[:linked_account].email.blank?

      # compute stargazer relations
      tracker_ids = team.owned_trackers.not_deleted.pluck(:id)
      stargazers = GithubStargazer.where(tracker_id: tracker_ids).joins(:linked_account).where('linked_accounts.person_id' => nil, 'linked_accounts.id' => mailer_options[:linked_account].id)
      mailer_options[:stargazer_relations] = stargazers.map { |sg| [('a stargazer' if sg.stargazer?), ('a watcher' if sg.subscriber?), ('a forker' if sg.forker?)] }.flatten.compact.uniq

      Mailer.team_update_created(mailer_options).deliver
    end
  end

  def send_all_emails(options={})
    # need stargazers to be accurate (usually a few seconds. can take a few minutes with 20k+ stargazers)
    # TODO: use github oauth token of admin
    team.sync_stargazers(oauth_token: options[:oauth_token]) if team.can_email_stargazers?
    distribution_lists = self.class.distribution_lists_for_team(team)

    # send emails to bountysource users
    if mailing_lists.include?('bountysource')
      distribution_lists[:people_ids].each do |person_id|
        self.delay(priority: 151).send_one_email(options.merge(person_id: person_id))
      end
    end

    # send emails to github users
    if mailing_lists.include?('github') && team.can_email_stargazers?
      distribution_lists[:linked_account_ids].each do |linked_account_id|
        self.delay(priority: 151).send_one_email(options.merge(linked_account_id: linked_account_id))
      end
    end
  rescue Exception => exception
    NewRelic::Agent.notice_error(exception)
    Rails.logger.info "TeamUpdate#send_all_emails Exception: #{exception.inspect}"
  ensure
    # always finish
  end

end
