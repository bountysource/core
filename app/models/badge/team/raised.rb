module Badge
  module Team
    class Raised < Badge::Team::Base
      def to_xml
        self.status = "#{number_to_dollars(total_raised)} raised"
        super
      end

      private

      def total_raised
        @total_raised ||= begin
          pledges = ::Pledge.active.where(fundraiser_id: team.fundraisers.pluck(:id))
          payins = ::TeamPayin.not_refunded.where(team_id: team.id)
          pledges.sum(:amount) + payins.sum(:amount)
        end
      end

    end
  end
end
