# == Schema Information
#
# Table name: teams
#
#  id                               :integer          not null, primary key
#  name                             :string           not null
#  slug                             :string
#  url                              :string
#  created_at                       :datetime         not null
#  updated_at                       :datetime         not null
#  cloudinary_id                    :string
#  bio                              :text
#  featured                         :boolean          default(FALSE), not null
#  linked_account_id                :integer
#  accepts_public_payins            :boolean          default(FALSE), not null
#  rfp_enabled                      :boolean          default(FALSE), not null
#  activity_total                   :decimal(, )      default(0.0), not null
#  bounties_disabled                :boolean
#  support_level_sum                :decimal(10, 2)
#  support_level_count              :integer
#  homepage_markdown                :text
#  homepage_featured                :integer
#  accepts_issue_suggestions        :boolean          default(FALSE), not null
#  new_issue_suggestion_markdown    :text
#  bounty_search_markdown           :text
#  resources_markdown               :text
#  monthly_contributions_sum        :decimal(10, 2)
#  monthly_contributions_count      :integer
#  can_email_stargazers             :boolean          default(FALSE), not null
#  previous_month_contributions_sum :decimal(10, 2)
#
# Indexes
#
#  index_companies_on_slug           (slug) UNIQUE
#  index_teams_on_activity_total     (activity_total)
#  index_teams_on_homepage_featured  (homepage_featured)
#  index_teams_on_linked_account_id  (linked_account_id)
#

class Team < ApplicationRecord
  has_paper_trail :only => [:slug, :name, :url, :bio, :homepage_markdown, :new_issue_suggestion_markdown, :bounty_search_markdown, :resources_markdown, :linked_account, :accepts_public_payins, :accepts_issue_suggestions, :can_email_stargazers, :cloudinary_id]

  has_cloudinary_image
  has_account class_name: "Account::Team"

  # NOTE: if you add any new relations, make sure the merge function below is updated as well
  has_many :member_relations, class_name: 'TeamMemberRelation'
  has_many :members, through: :member_relations, source: :person

  has_many :invites, class_name: 'TeamInvite', foreign_key: :team_id

  has_many :pledges, as: :owner
  has_many :bounties, as: :owner
  has_many :created_payins, as: :owner, class_name: "TeamPayin"

  has_many :tracker_relations, class_name: 'TeamTrackerRelation'
  has_many :trackers, through: :tracker_relations

  has_many :owned_trackers, class_name: 'Tracker'

  # TODO: should be through: owned_github_trackers ??
  # has_many :owned_github_trackers, class_name: 'Github::Repository'
  # has_many :github_stargazers, through: :owned_github_trackers, source: :stargazers
  # has_many :github_issues, through: :github_trackers, source: :issues
  # has_many :github_comments, through: :github_issues, source: :comments

  has_many :payins, class_name: "TeamPayin"

  belongs_to :linked_account, class_name: 'LinkedAccount::Base'

  has_many :issue_ranks, class_name: 'IssueRank::TeamRank'
  has_many :issues, through: :issue_ranks

  has_many :fundraisers
  has_many :received_pledges, through: :fundraisers, source: :pledges
  has_many :updates, class_name: 'TeamUpdate'

  has_many :parent_tag_relations, as: :parent, class_name: 'TagRelation'
  has_many :parent_tag_relation_votes, through: :parent_tag_relations, class_name: 'TagVote', source: :votes

  has_many :child_tag_relations, as: :child, class_name: 'TagRelation'
  has_many :child_tag_relation_votes, through: :child_tag_relations, class_name: 'TagVote', source: :votes

  has_many :parent_team_activity_inclusions, class_name: 'TeamActivityInclusion', foreign_key: :parent_team_id
  has_many :parent_team_activity_inclusions_teams, through: :parent_team_activity_inclusions, source: :child_team
  has_many :child_team_activity_inclusions, class_name: 'TeamActivityInclusion', foreign_key: :child_team_id
  has_many :child_team_activity_inclusions_teams, through: :child_team_activity_inclusions, source: :parent_team

  has_many :support_levels
  has_many :support_level_payments, through: :support_levels, source: :payments
  has_one :support_offering

  has_many :issue_suggestions

  has_many :team_bounty_hunters

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: { case_sensitive: false }, format: { with: /\A[a-z0-9\-\._]+\Z/i }

  scope :featured, lambda { where(featured: true) }
  scope :accepts_public_payins, lambda { where(accepts_public_payins: true) }
  scope :newest, lambda { joins(:member_relations).where('team_member_relations.admin=true').group('teams.id').reorder('min(team_member_relations.created_at) desc') }

  class Error < StandardError ; end
  class Forbidden < Error ; end
  class TeamNotFound < Error ; end

  # quick hack so rabl can pull from these
  def prioritized_trackers
    tracker_ids = trackers.pluck(:id) + owned_trackers.pluck(:id)
    Tracker.where(id: tracker_ids.uniq).order('COALESCE(open_issues,0) desc')
  end

  def manage_issue?(issue)
    owned_trackers.pluck(:id).include?(issue.tracker_id)
  end

  # Person is member of a team
  def person_is_member?(person)
    person && relation_for_owner(person).try(:member?)
  end

  # Person has admin access?
  def person_is_admin?(person)
    person_is_member?(person) && relation_for_owner(person).admin?
  end

  # Person can spend money on behalf of the team?
  def person_is_developer?(person)
    person_is_member?(person) && relation_for_owner(person).developer?
  end

  # Person is publicly listed as a member of the team?
  def person_is_public?(person)
    person_is_member?(person) && relation_for_owner(person).public?
  end

  # Add a new member to the team. Assumes someone invoking this method
  # is an admin.You can optionally pass along permissions through attrs
  def add_member(owner, attrs={})
    enable_accepts_team_payins_if_team_is_empty

    no_emails = attrs.delete(:no_emails)

    relation = relation_for_owner(owner) || member_relations.new
    relation.member = true
    relation.public = attrs[:public] if attrs.has_key?(:public)
    relation.developer = attrs[:developer] if attrs.has_key?(:developer)
    relation.admin = attrs[:admin] if attrs.has_key?(:admin)
    relation.owner_type = owner.class.name
    relation.owner_id = owner.id

    # When owner is a linked account, pull person from it.
    # Otherwise, if it's a person... well..
    case owner
    when LinkedAccount::Base then relation.person = owner.person
    when Person then relation.person = owner
    end

    relation.save!

    if owner.is_a?(Person) && !no_emails
      # send email to the new member
      owner.send_email :added_to_team, team: self

      # send email to team admins, excluding the new member
      admins.each do |admin|
        unless admin == owner
          admin.send_email :team_member_added, team: self, invitee: owner
        end
      end
    end

    owner
  end

  def member_requested_invite(person)
    admins.each do |admin|
      admin.send_email :team_member_requested_invite, team: self, invitee: person
    end
  end

  # Add someone to the team via email and profile link URL.
  def invite_member(email, attrs={})
    invite = invites.create!(attrs.merge(email: email))
    invite.delay.send_email
    invite
  end

  # remove person from the team Assumes someone invoking this method
  # is an admin. Just returns relation if person already a member.
  # You can optionally pass along permissions through attrs
  def remove_member(person)
    relation_for_owner(person).update_attributes!(member: false, developer: false, admin: false, public: false)
  end

  # if a member is being added to the team and there aren't previously members, enable it!
  def enable_accepts_team_payins_if_team_is_empty
    update_attributes!(accepts_public_payins: true) if has_no_members?
  end

  def claim_team(member)
    enable_accepts_team_payins_if_team_is_empty
    relation = relation_for_owner(member) || member_relations.new(person: member, owner: member)
    relation.update_attributes!(member: true, developer: true, admin: true, public: true)
    member.send_email(:claim_team, team: self)
  end

  def person_can_claim?(person)
    community_can_edit? && person.team_member_relations.where(team_id: self.id).exists?
  end

  # this one is weird.. only used in admin to toggle soembody between suggested and actual
  def set_member_member(member, val)
    if (relation = relation_for_owner(member))
      relation.update_attributes(member: val)
    end
  end

  def set_member_admin(member, val)
    if (relation = relation_for_owner(member))
      relation.update_attributes(admin: val)
    end
  end

  def set_member_developer(member, val)
    if (relation = relation_for_owner(member))
      relation.update_attributes(developer: val)
    end
  end

  def set_member_public(member, val)
    if (relation = relation_for_owner(member))
      relation.update_attributes(public: val)
    end
  end

  # Return the relation for a person.
  def relation_for_owner(owner)
    type = owner.class.name.split('::').first
    member_relations.where('owner_type LIKE ?', "#{type}%").where(owner_id: owner.id).first
  end

  def to_param
    slug
  end

  # Change 'slug' to 'Custom URL' in error messages
  def self.human_attribute_name(attr, options={})
    {
      slug: 'Custom URL'
    }[attr] || super
  end

  def item_name
    name
  end

  def display_name
    name
  end

  def admins
    Person.joins(:team_member_relations).where("team_member_relations.team_id = :id AND team_member_relations.admin = true", id: id)
  end

  def developers
    Person.joins(:team_member_relations).where("team_member_relations.team_id = :id AND team_member_relations.developer = true", id: id)
  end

  def admins_and_developers
    (admins + developers).uniq
  end

  def public_members
    Person.joins(:team_member_relations).where("team_member_relations.team_id = :id AND team_member_relations.public = true", id: id)
  end

  # Get member relations, rejecting those lacking the public permission.
  # Optionally, provide people that should be included regardless of the public permission
  def public_member_relations(*people)
    excluded_ids = people.select { |p| p.is_a?(Person) }.map(&:id)
    member_relations.where("public = true OR person_id IN (:ids)", ids: excluded_ids)
  end

  # return who the person was invited by
  def invited_by(person)
    relation_for_owner(person).inviter
  end

  def add_tracker(tracker, attrs={})
    relation = relation_for_tracker(tracker)
    relation ||= tracker_relations.create(attrs.merge(tracker: tracker))
    relation
  end

  def remove_tracker(tracker)
    tracker.update_attributes!(team: nil) if tracker.team == self
    relation = relation_for_tracker(tracker)
    relation.try(:destroy)
  end

  # Get the relation for a Tracker, if it exists
  def relation_for_tracker(tracker)
    tracker_relations.where(tracker_id: tracker.id).first
  end

  def active_bounties
    bounties.visible
  end

  def open_issues_count
    bounties.active.distinct.count(:issue_id)
  end

  def open_bounties_amount
    bounties.active.sum(:amount).to_f
  end

  def closed_bounties_amount
    bounties.paid.sum(:amount).to_f
  end

  def owned_issues_active_bounties_amount
    owned_trackers
      .joins(:issues)
      .where('issues.bounty_total > ?', 0)
      .where(issues: { paid_out: false })
      .sum('issues.bounty_total')
  end

  def self.top_backers
    bounty_posters = Team.joins(:bounties).where("bounties.owner_type LIKE 'Team%'").merge(Bounty.visible).group("teams.id, bounties.id").select("teams.*, sum(bounties.amount) as alltime_backed").to_a
    pledge_givers = Team.joins(:pledges).where("pledges.owner_type LIKE 'Team%'").merge(Pledge.active).group("teams.id, pledges.id").select("teams.*, sum(pledges.amount) as alltime_pledged").to_a
    top_backers_map = Hash.new(0)

    bounty_posters.each do |team|
      top_backers_map[team] += team.alltime_backed.to_i
    end

    pledge_givers.each do |team|
      top_backers_map[team] += team.alltime_pledged.to_i
    end

    return top_backers_map
  end

  def add_issue(issue)
    relation = issue_relations.where(issue_id: issue.id).first
    relation ||= issue_relations.create!(issue: issue)
  end

  def remove_issue(issue)
    issues.delete(issue)
  end

  def safe_destroy!
    TeamMemberRelation.where(team_id: self.id).delete_all
    TeamInvite.where(team_id: self.id).delete_all
    TeamTrackerRelation.where(team_id: self.id).delete_all
    TeamUpdate.where(team_id: self.id).delete_all
    Tracker.where(team_id: self.id).update_all(team_id: nil)


    bad_relation_ids = TagRelation.where(parent_id: self.id, parent_type: 'Team').pluck(:id)
    bad_relation_ids += TagRelation.where(child_id: self.id, child_type: 'Team').pluck(:id)
    TagRelation.where(id: bad_relation_ids).delete_all
    TagVote.where(tag_relation_id: bad_relation_ids).delete_all

    TeamActivityInclusion.where(parent_team_id: self.id).delete_all
    TeamActivityInclusion.where(child_team_id: self.id).delete_all

    # if there is any money left in their account, transfer it back to liability
    if account && account.balance > 0
      from_account = account
      to_account = Account::Liability.instance
      amount = from_account.balance

      transaction = Transaction::InternalTransfer::DeletedOwner.create!(
        audited: true,
        description: "#{self.class.name}(#{id}) - $#{amount} owner deleted, reclaiming funds #{from_account.class.name}#{from_account.id} to #{to_account.class.name}(#{to_account.id})"
      )

      transaction.splits.create!(
        amount: -1 * amount,
        account: from_account,
        item: self
      )

      transaction.splits.create!(
        amount: amount,
        account: to_account,
        item: self
      )
    end

    self.destroy
  end


  # Import an Organization from Github.
  # If we have already created a Team, a LinkedAccount for the Org will be created and associated with the Team
  # if necessary.
  def self.import_from_github_organization(org_name)
    org_response = Github::API.call(url: "/orgs/#{org_name}")

    if org_response.success?
      org_data = org_response.data

      team = Team.where('teams.name = ? OR teams.slug = ?', org_data['name'], org_data['login']).first
      team ||= Team.joins(:linked_account).where('linked_accounts.id = ?', org_data['id']).first
      team ||= Team::GithubOrganization.create!(
        slug: org_data['login'],
        name: org_data['name'] || org_data['login'],
        image_url: org_data['avatar_url'],
        url: org_data['blog']
      )

      # Create a new LinkedAccount::Github::Organization for the organization if necessary
      unless team.linked_account
        linked_account = LinkedAccount::Github::Organization.create!(
          uid: org_data['id'],
          login: org_data['login'],
          email: org_data['email'],
          company: org_data['company'],
          location: org_data['location'],
          image_url: org_data['avatar_url']
        )
        team.update_attribute(:linked_account, linked_account)
      end

      team
    end
  end

  def import_projects_from_github
    response = Github::API.call(url: "/orgs/#{linked_account.login}/repos", params: { per_page: 100 })

    if response.success?
      repos = response.data

      if response.pages.count > 1
        EM.run {
          EM::Iterator.new(response.pages[1..-1], 40).each(
            proc { |url, iterator|
              http = EventMachine::HttpRequest.new(url).get

              http.callback { |http|
                repos += JSON.parse(http.response)
                iterator.next
              }
            },
            proc { EM.stop }
          )
        }
      end

      repos.each do |repo_data|
        tracker = Tracker.magically_turn_url_into_tracker_or_issue(repo_data['html_url'])
        add_tracker(tracker)
        tracker.update_attribute(:team, self) unless tracker.team
      end

      trackers
    end
  end

  def import_members_from_github
    org_members_response = Github::API.call(url: "/orgs/#{linked_account.login}/members", params: { per_page: 100 })

    members = []

    # Find or create LinkedAccount::Githubs from GitHub org members data
    if org_members_response.success?
      process_member_json = lambda { |json|
        linked_account = LinkedAccount::Github::User.where('linked_accounts.uid = ? OR linked_accounts.login = ?', json['remote_id'], json['login']).first
        if linked_account
          linked_account.update_attributes!(image_url: json['avatar_url'])
          linked_account
        else
          LinkedAccount::Github::User.create!(
            login: json['login'],
            uid: json['uid'],
            image_url: json['avatar_url']
          )
        end
      }

      members += org_members_response.data.map { |member| process_member_json[member] }

      # Follow pagination, yeah!
      if org_members_response.pages.count > 1
        EM.run {
          EM::Iterator.new(org_members_response.pages[1..-1], 40).each(
            proc { |url, iterator|
              http = EventMachine::HttpRequest.new(url).get

              http.callback { |http|
                members_json = JSON.parse(http.response)
                members += members_json.map { |member| process_member_json[member] }
                iterator.next
              }
            },

            proc { EM.stop }
          )
        }
      end
    end

    # For the LinkedAccounts that are found for the Team members,
    # establish relations to the team if necessary.
    LinkedAccount::Github::User.where(id: members.map(&:id)).find_each do |member_linked_account|
      # owner prefers Person over LinkedAccount
      owner = member_linked_account.person || member_linked_account
      add_member(owner, public: true, no_emails: true)
    end

    members
  end

  def member_linked_accounts
    # Collect LinkedAccount::Github::User ids from TeamMemberRelwations
    # Also, collect Github accounts from members added as People
    linked_account_ids = member_relations.where('owner_type LIKE ?', 'LinkedAccount%').pluck(:owner_id)
    linked_account_ids += member_relations.joins(:person => [:github_account]).pluck('linked_accounts.id')
    LinkedAccount::Github::User.where(id: linked_account_ids)
  end

  # For each LinkedAccount::Github::User through MemberRelations, increment IssueRank::LinkedAccountGithub for Team and Issue
  # from GitHub user events.
  def import_linked_account_issue_ranks

    # For each member of the team with a LinkedAccount::Github::User, fetch all events.
    # For each event:
    # 1. Find or create IssueRank::LinkedAccountGithub from Issue and LinkedAccount::Github::User
    # 2. Increment the LAIR for the LinkedAccount and Issue based on the GitHub event owner_type
    member_linked_accounts.find_each do |member_linked_account|
      member_linked_account.delay.sync_issue_ranks
    end
  end

  def calculate_issue_ranks
    member_linked_accounts.find_each do |member_linked_account|
      IssueRank::LinkedAccountGithub.where(linked_account_id: member_linked_account.id).group('issue_ranks.id, issue_ranks.issue_id').select('issue_ranks.*, sum(issue_ranks.rank) as alltime_rank').each do |result|
        issue_rank = issue_ranks.where(issue_id: result.issue_id).first
        issue_rank ||= issue_ranks.create!(issue: Issue.find(result.issue_id))
        issue_rank.update_attributes(
          rank: result.alltime_rank,
          last_event_created_at: result.last_event_created_at
        )
      end
    end
  end

  def update_activity_total(include_activity_parents=true)
    # start by updating all parents
    if include_activity_parents
      child_team_activity_inclusions_teams.each { |t| t.update_activity_total(false) }
    end

    # all team IDs to include
    team_ids = [self.id] + parent_team_activity_inclusions_teams.pluck(:id)

    tmp_total = 0.0
    tmp_total += Bounty.not_refunded.joins(:issue => :tracker).where("(bounties.owner_type='Team' AND bounties.owner_id in (?)) OR trackers.team_id in (?)", team_ids, team_ids).sum(:amount)
    tmp_total += Pledge.not_refunded.joins(:fundraiser).where("(pledges.owner_type='Team' AND pledges.owner_id in (?)) OR fundraisers.team_id in (?)", team_ids, team_ids).sum(:amount)
    tmp_total += TeamPayin.not_refunded.where("(owner_type='Team' AND owner_id in (?)) OR team_id IN (?)", team_ids, team_ids).sum(:amount)

    update_attribute(:activity_total, tmp_total.to_f)
  end

  def self.update_activity_totals
    team_ids = []
    team_ids += Bounty.not_refunded.where(owner_type: 'Team').pluck('DISTINCT owner_id')
    team_ids += Bounty.not_refunded.joins(:issue => :tracker).pluck('DISTINCT team_id')
    team_ids += Pledge.not_refunded.where(owner_type: 'Team').pluck('DISTINCT owner_id')
    team_ids += Pledge.not_refunded.joins(:fundraiser).pluck('DISTINCT team_id')
    team_ids += TeamPayin.not_refunded.where(owner_type: 'Team').pluck('DISTINCT owner_id')
    team_ids += TeamPayin.not_refunded.pluck('DISTINCT team_id')

    Team.where(id: team_ids.uniq.compact).find_each { |team| team.update_activity_total(false) }
  end

  def issues_count
    # if the team owns any trackers, show issuse
    owned_trackers.count > 0 ? 1 : 0
  end

  def updates_count
    updates.published.count
  end

  def trackers_count
    trackers.count
  end

  def members_count
    member_relations.where(public: true).count
  end

  def tagged_count
    child_tag_relations.where('weight>0').count
  end

  def backers_count
    # if the team accepts payins, show backers tab
    accepts_public_payins ? 1 : 0
  end

  def fundraisers_count
    fundraisers.published.count
  end

  def has_members?
    member_relations.members_only.any?
  end

  def has_no_members?
    member_relations.members_only.empty?
  end

  def community_can_edit?
    has_no_members?
  end

  def premerge(bad_model)
    raise "Both teams have github orgs: #{self.linked_account.login} #{bad_model.linked_account.login}" if self.linked_account_id && bad_model.linked_account_id

    self.account.try(:merge!, bad_model.account) #merge accounts but keep splits/transactions

    bad_model.member_relations.where(person_id: self.member_relations.pluck(:person_id)).delete_all
    bad_model.tracker_relations.where(tracker_id: self.tracker_relations.pluck(:tracker_id)).delete_all
    bad_model.invites.where(email: self.invites.pluck(:email)).delete_all

    TagRelation.merge_two_tags(self, bad_model)
  end

  def postmerge(bad_model)
    update_attributes!(linked_account: bad_model.linked_account) if bad_model.linked_account_id
    update_attributes!(slug: bad_model.slug) if self.slug.length > bad_model.slug.length

    Unsubscribe.where(category: "team_updates_#{bad_model.id}").update_all(category: "team_updates_#{self.id}")
  end

  # across all teams
  def self.global_salt_financial_summary
    retval = {}

    # previous month sum
    retval[:previous_month_sum] = SupportLevelPayment.created_this_month(1.month.ago).sum(:amount).to_f
    retval[:previous_month_sum] += TeamPayin.not_refunded.not_from_members.created_this_month(1.month.ago).sum(:amount).to_f
    retval[:previous_month_sum] += Pledge.created_this_month(1.month.ago).sum(:amount).to_f

    # # previous month number of people
    # person_ids = SupportLevelPayment.created_this_month(1.month.ago).joins(:support_level).pluck(:person_id)
    # person_ids += TeamPayin.not_from_members.created_this_month(1.month.ago).pluck(:person_id)
    # person_ids += Pledge.created_this_month(1.month.ago).pluck(:person_id)
    # retval[:previous_month_cnt] = person_ids.uniq.length

    # current month sum
    retval[:current_month_sum] = SupportLevel.active.sum(:amount).to_f
    retval[:current_month_sum] += TeamPayin.not_refunded.not_from_members.created_this_month.sum(:amount).to_f
    retval[:current_month_sum] += Pledge.created_this_month.sum(:amount).to_f

    retval[:total_sum] = SupportLevelPayment.sum(:amount).to_f
    retval[:total_sum] += TeamPayin.not_refunded.not_from_members.sum(:amount).to_f
    retval[:total_sum] += Pledge.sum(:amount).to_f

    # current month number of people
    person_ids = SupportLevel.active.pluck(:person_id)
    person_ids += TeamPayin.not_refunded.not_from_members.created_this_month.pluck(:person_id)
    person_ids += Pledge.created_this_month.pluck(:person_id)
    retval[:current_month_cnt] = person_ids.uniq.length

    # teams last+this month
    team_ids = SupportLevel.active.pluck(:team_id)
    team_ids += SupportLevelPayment.created_this_month(1.month.ago).joins(:support_level).pluck(:team_id)
    team_ids += TeamPayin.not_refunded.not_from_members.created_this_month.pluck(:team_id)
    team_ids += TeamPayin.not_refunded.not_from_members.created_this_month(1.month.ago).pluck(:team_id)
    team_ids += Pledge.joins(:fundraiser).created_this_month.pluck(:team_id)
    team_ids += Pledge.joins(:fundraiser).created_this_month(1.month.ago).pluck(:team_id)
    retval[:total_teams] = team_ids.uniq.length

    retval[:salt_teams] = Team.accepts_public_payins.count

    retval
  end

  # called via an hourly cron to reset financials at the beginning of every month...
  def self.update_financial_caches_for_active_teams
    Team.where("monthly_contributions_count>0 or previous_month_contributions_sum>0").each(&:update_financial_cache_counters)
  end

  def update_financial_cache_counters
    updates = {}
    updates[:support_level_sum] = self.support_levels.active.sum(:amount)
    updates[:support_level_count] = SupportLevel.connection.select_one("SELECT COUNT(*) FROM (#{SupportLevel.grouped_supporter_amounts(self).to_sql}) as t")['count'].to_i

    # active support_levels + pledges this month + teampayins this month
    updates[:monthly_contributions_sum] = [
      updates[:support_level_sum],
      self.received_pledges.created_this_month.sum(:amount),
      self.payins.not_refunded.not_from_members.created_this_month.sum(:amount),
    ].sum

    updates[:monthly_contributions_count] = [
      updates[:support_level_count],
      self.received_pledges.created_this_month.count,
      self.payins.not_refunded.not_from_members.created_this_month.count
    ].sum


    # active support_levels + pledges this month + teampayins this month
    updates[:previous_month_contributions_sum] = [
      self.support_level_payments.created_this_month(1.month.ago).sum(:amount),
      self.received_pledges.created_this_month(1.month.ago).sum(:amount),
      self.payins.not_refunded.not_from_members.created_this_month(1.month.ago).sum(:amount)
    ].sum

    update_attributes!(updates)
  end

  def support_level_next_goal
    goals = (support_offering.try(:goals) || []).map { |g| g['amount'].to_f }.sort
    goals.find { |g| g > (monthly_contributions_sum || 0) } || goals.last
  end

  def is_bounty_hunter?(person)
    person && team_bounty_hunters.active.where(person: person).exists?
  end

  def bounty_hunter_count
    Person.bounty_hunters(team: self).count(:all)
  end

  def sync_stargazers(options={})
    tracker_ids = owned_trackers.not_deleted.where(type: 'Github::Repository').pluck(:id)
    GithubStargazer.sync_stargazers_for(tracker_ids: tracker_ids, oauth_token: options[:oauth_token])
  end

  def top_supporters(options={})
    ApplicationRecord.connection.unprepared_statement do
      alltime_support_level_payments = self.support_level_payments.not_refunded.joins(:support_level).select(%(
        COALESCE(support_levels.owner_id, support_levels.person_id) as owner_id,
        COALESCE(support_levels.owner_type, 'Anon') as owner_type,
        0 as monthly_amount,
        support_level_payments.amount as alltime_amount,
        support_level_payments.created_at as created_at
      ))
      alltime_pledges = self.received_pledges.select(%(
        (case when anonymous=true then pledges.person_id when owner_id is null then pledges.person_id else owner_id end) as owner_id,
        (case when anonymous=true then 'Anon' when owner_type is null then 'Person' else owner_type end) as owner_type,
        0 as monthly_amount,
        amount as alltime_amount,
        pledges.created_at
      ))

      # NOTE: this does not respect for anonymous team_payins
      alltime_team_payins = self.payins.select(%(
        COALESCE(owner_id, person_id) as owner_id,
        COALESCE(owner_type, 'Person') as owner_type,
        0 as monthly_amount,
        amount as alltime_amount,
        created_at
      ))


      monthly_support_levels = self.support_levels.active.select(%(
        COALESCE(owner_id, person_id) as owner_id,
        COALESCE(owner_type, 'Anon') as owner_type,
        amount as monthly_amount,
        0 as alltime_amount,
        created_at
      ))
      monthly_pledges = self.received_pledges.created_this_month.select(%(
        (case when anonymous=true then pledges.person_id when owner_id is null then pledges.person_id else owner_id end) as owner_id,
        (case when anonymous=true then 'Anon' when owner_type is null then 'Person' else owner_type end) as owner_type,
        amount as monthly_amount,
        0 as alltime_amount,
        pledges.created_at
      ))
      # NOTE: this does not respect for anonymous team_payins
      monthly_team_payins = self.payins.created_this_month.select(%(
        COALESCE(owner_id, person_id) as owner_id,
        COALESCE(owner_type, 'Person') as owner_type,
        amount as monthly_amount,
        0 as alltime_amount,
        created_at
      ))

      order_by = case options[:order]
        when 'alltime' then 'alltime_amount DESC, monthly_amount DESC, created_at'
        when 'created' then 'created_at, monthly_amount DESC, alltime_amount DESC'
        else 'monthly_amount DESC, alltime_amount DESC, created_at'
      end

      collection = ApplicationRecord.connection.select_all("
        SELECT
          owner_type,
          owner_id,
          sum(monthly_amount) as monthly_amount,
          sum(alltime_amount) as alltime_amount,
          min(created_at) as created_at
        FROM
          (
            (#{monthly_support_levels.to_sql})
            UNION (#{monthly_pledges.to_sql})
            UNION (#{monthly_team_payins.to_sql})
            UNION (#{alltime_support_level_payments.to_sql})
            UNION (#{alltime_pledges.to_sql})
            UNION (#{alltime_team_payins.to_sql})
          ) as T1
        GROUP BY owner_type, owner_id
        ORDER BY #{order_by}, created_at
        LIMIT #{options.has_key?(:per_page) ? options[:per_page].to_i : 30}
        OFFSET #{options.has_key?(:offset) ? options[:offset].to_i : 0}
      ")

      team_map = Team.where(id: collection.select { |row| row['owner_type'] == 'Team' }.map { |row| row['owner_id'] }).inject({}) { |memo,obj| memo[obj.id] = obj; memo }
      person_map = Person.where(id: collection.select { |row| row['owner_type'] == 'Person' }.map { |row| row['owner_id'] }).inject({}) { |memo,obj| memo[obj.id] = obj; memo }
      return collection.map { |row| OpenStruct.new(
        monthly_amount: row['monthly_amount'].to_f,
        alltime_amount: row['alltime_amount'].to_f,
        created_at: Time.parse(row['created_at']),
        owner: (
                 (row['owner_type'] == 'Person' && person_map[row['owner_id'].to_i]) ||
                 (row['owner_type'] == 'Team' && team_map[row['owner_id'].to_i]) ||
                 nil
               )
      ) }
    end
  end

end
