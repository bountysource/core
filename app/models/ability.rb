class Ability

  include CanCan::Ability

  LINKED_ACCOUNTS = [
    LinkedAccount::Github::User,
    LinkedAccount::Twitter,
    LinkedAccount::Facebook
  ]

  ANONYMIZABLE_RECORDS = [
    Pledge,
    Bounty,
    BountyClaimResponse
  ]

  PUBLISHABLE_RECORDS = [
    Fundraiser
  ]

  # See the wiki for halp:
  # https://github.com/ryanb/cancan/wiki/Defining-Abilities
  def initialize(person)
    # By default, can read everything. Explicitly state what cannot be viewed below
    can :read, :all

    can :read_anonymous, :all
    cannot :read_anonymous, ANONYMIZABLE_RECORDS, anonymous: true
    cannot :read, PUBLISHABLE_RECORDS,  published: false

    # Cannot see bounties and pledges that have been refunded
    cannot :read, Bounty, status: Bounty::Status::REFUNDED
    cannot :read, Pledge, status: Pledge::Status::REFUNDED

    # Can you see the owner of an item?
    can :see_owner, ANONYMIZABLE_RECORDS, anonymous: false

    if person
      # Can MANAGE your own anon records, but not see them.
      can :manage, ANONYMIZABLE_RECORDS, person_id: person.id
      # Allow fundraiser owners to
      can :manage, Pledge do |pledge|
        pledge.fundraiser.person_id = person.id
      end
      cannot :read_anonymous, ANONYMIZABLE_RECORDS, person_id: person.id, anonymous: true

      # Can manage your own unpublished records
      can :manage, PUBLISHABLE_RECORDS, person_id: person.id

      # Can manage your own person model
      can :manage, Person, id: person.id

      # Can manage your own BountyClaims and BountyClaimResponses
      can :manage, [BountyClaim, BountyClaimResponse], person_id: person.id

      # Can change team settings.
      can :modify_team, Team do |team|
        relation = team.relation_for_owner(person)
        relation && (relation.admin? || relation.developer?)
      end

      # Can add/remove/invite team members
      can :modify_team_members, Team do |team|
        relation = team.relation_for_owner(person)
        relation && relation.admin?
      end

      # Can add/remove projects
      can :modify_team_projects, Team do |team|
        relation = team.relation_for_owner(person)
        relation && (relation.admin? || relation.developer?)
      end

      # TODO when we add an accountant role, they need to be added here.
      # Can see the team account balance.
      can :view_team_account, Team do |team|
        relation = team.relation_for_owner(person)
        relation && (relation.developer? || relation.admin?)
      end

      # TODO when we add an accountant role, they need to be added here.
      # Can add funds to the team account.
      can :fund_team_account, Team do |team|
        relation = team.relation_for_owner(person)
        (relation && relation.admin?) || team.accepts_public_payins
      end

      # Can use the team account balance to create Bounties and Pledges.
      can :use_team_account, Team do |team|
        relation = team.relation_for_owner(person)
        relation && relation.developer?
      end

      can :modify_proposal, Proposal do |proposal|
        proposal.person_id == person.id
      end

      can :add_proposal_to_cart, Proposal do |proposal|
        relation = proposal.managing_team.relation_for_owner(person)
        relation && (relation.developer? || relation.admin?)
      end

      # Person can respond to bounty claims on an issue if a backer, or a developer on a team that backed the issue.
      can :respond_to_claims, Issue do |issue|
        if issue.fiat?
          is_creator = issue.bounties.pluck(:person_id).include?(person.id)
          is_on_team = TeamMemberRelation.where(team_id: issue.bounties.where(owner_type: 'Team').pluck(:owner_id), developer: true).pluck(:person_id).include?(person.id)
          !issue.can_add_bounty && (issue.bounty_total > 0) && (is_creator || is_on_team)
        elsif issue.crypto?
          is_crypto_bounty_creator = issue.crypto_bounties.where(owner_type: 'Person').pluck(:owner_id).include?(person.id)
          !issue.can_add_bounty && (issue.crypto_bounty_total > 0) && (is_crypto_bounty_creator)
        end
        
      end

      # Person can edit a tracker page
      can :edit_tracker, Tracker do |tracker|
        if (relation = tracker.relation_for_person(person))
          relation.can_edit?
        end
      end

      # Person can manage Fundraiser
      # 1. If they created it
      # 2. If it's owned by a Team, and they are an Admin on the team
      can :manage_fundraiser, Fundraiser do |fundraiser|
        authenticated = fundraiser.person == person
        if !authenticated && fundraiser.team
          authenticated = fundraiser.team.member_relations.find_by(person_id: person.id, admin: true).present?
        end
        authenticated
      end

      # Can you see the owner of an item?
      can :see_owner, ANONYMIZABLE_RECORDS do |item|
        item.anonymous ? (person == item.person) : true
      end

      # You can create events if you're an admin! YEAH!
      can :manage_events, Event do
        person.admin?
      end

      can :manage_tracker_plugin, TrackerPlugin, person_id: person.id
    end
  end
end
