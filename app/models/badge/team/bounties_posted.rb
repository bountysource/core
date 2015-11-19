module Badge
  module Team
    class BountiesPosted < Badge::Team::Base
      def to_xml
        person_ids = team.members.pluck(:id)
        bounties = ::Bounty.not_refunded.where(person_id: person_ids).select('distinct issue_id')

        self.status = "#{pluralize(bounties.count, 'bounty')} (#{number_to_dollars(bounties.sum(:amount))})"
        super
      end
    end
  end
end
