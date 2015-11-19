module Badge
  module Team
    class BountiesReceived < Badge::Team::Base
      def to_xml
        self.status = "#{pluralize(bounties.count, 'bounty')} (#{number_to_dollars(bounties.sum(:amount))})"
        super
      end

      private

      def bounties
        @bounties ||= begin
          tracker_ids = ::Tracker.where(team: team).pluck(:id)
          issue_ids = ::Issue.where(tracker_id: tracker_ids).where('bounty_total > 0')
          ::Bounty.not_refunded.where(issue_id: issue_ids).select('distinct issue_id')
        end
      end
    end
  end
end
