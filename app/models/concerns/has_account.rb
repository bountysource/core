module HasAccount
  extend ActiveSupport::Concern

  class_methods do
    def has_account(options={})
      self.class_eval do
        # NOTE: the create/build methods for Account are overridden below. You have been warned.
        has_one   :account,       options.merge(as: :owner)
        has_many  :splits,        through: :account
        has_many  :txns,  through: :splits

        def account_balance
          account.try(:balance) || BigDecimal('0.00', 2)
        end

        def account_balance_money
          Money.new(account_balance*100,'USD')
        end

        # Why can't I use these methods? Because the has_one association kills the item_id as part of it's validation
        # if the account is invalid.
        #
        # Somewhat hacky fix: override the dynamically added has_one methods. Pull the account class
        # from ActiveRecord reflections, which are created from ActiveRecord::has_one, and use that to create/build
        # an account, manually passing this in as the item. bypasses the aforementioned craziness.

        def self.account_class
          reflect_on_association(:account).options[:class_name].constantize
        end

        def account_class
          self.class.account_class
        end

        def create_account(attrs={})
          account_class.create attrs.merge owner: self
        end

        def create_account!(attrs={})
          account_class.create! attrs.merge owner: self
        end

        def build_account(attrs={})
          account_class.new attrs.merge owner: self
        end
      end
    end
  end
end
