class BadgeFactory
  class ParseError < StandardError ; end

  def initialize(options)
    @options = options
  end

  def issue
    issue_id = @options.fetch(:issue_id)
    issue = Issue.find_by!(id: issue_id)
    Badge::Issue.new(issue)
  end

  def tracker
    tracker_id = @options.fetch(:tracker_id)
    tracker = Tracker.find_by!(id: tracker_id)
    Badge::Tracker.new(tracker)
  end

  def team
    team_id = @options.fetch(:team_id)
    team = Team.find_by!(id: team_id)

    case @options.fetch(:style, nil)
    when 'bounties_posted'
      Badge::Team::BountiesPosted.new(team)

    when 'bounties_received'
      Badge::Team::BountiesReceived.new(team)

    when 'raised'
      Badge::Team::Raised.new(team)

    else
      # Default to the bounties posted style when no style is asked for.
      Badge::Team::BountiesPosted.new(team)
    end
  end

end
