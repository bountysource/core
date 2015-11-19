# == Schema Information
#
# Table name: teams
#
#  id                    :integer          not null, primary key
#  name                  :string(255)      not null
#  slug                  :string(255)
#  url                   :string(255)
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  cloudinary_id         :string(255)
#  bio                   :text
#  featured              :boolean          default(FALSE), not null
#  type                  :string(255)
#  linked_account_id     :integer
#  accepts_public_payins :boolean          default(TRUE)
#

module Badge
  module Team
    class Base < Badge::Base
      attr_accessor :team

      def initialize(team)
        self.team = team
        super
      end

    end
  end
end
