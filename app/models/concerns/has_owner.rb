# NOTE: Uses the following columns:
#   :owner_id   integer
#   :owner_type string
#   :person_id  integer (optional)
#   :anonymous  boolean (optional)

module HasOwner
  extend ActiveSupport::Concern

  class_methods do
    def has_owner
      self.class_eval do
        belongs_to :owner, polymorphic: true

        # Override owner get method. Defaults to #person if polymorphic owner is nil
        # if it's anonymous, return nil unless optionally provided person is authorized.
        # Note: uses ability.rb for authorization

        def owner(auth_person=nil)
          if Ability.new(auth_person).can?(:read_anonymous, self)
            super() || self.person
          end
        end

        # given model that has_owner, return the name of model.owner
        # if the owner is anonymous, return "anonymous"
        def owner_display_name(options={})
          if owner
            case owner
            when Person
              owner.display_name
            when Team
              owner.display_name
            else raise "Unexpected owner type #{owner.class}"
            end
          else
            options[:capitalize] ? "An anonymous user" : "an anonymous user"
          end
        end
      end
    end
  end
end
