# sets log level to :warning
Delayed::Backend::ActiveRecord::Job.class_eval do
  class << self
    def reserve_with_warning(*args, &block)
      log_level = ActiveRecord::Base.logger.level
      ActiveRecord::Base.logger.level = 1
      reserve_without_warning(*args, &block)
    ensure
      ActiveRecord::Base.logger.level = log_level
    end
    alias_method_chain :reserve, :warning
  end
end


Delayed::Worker.default_priority = 50