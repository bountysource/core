require 'new_relic/agent/method_tracer'

# add helper methods to base Object for tracking metrics.
Object.class_eval do
  # track a single metric.
  # @name the name of the metric, e.g. "Custom/foo/bar"
  # @amount the integer amount of the stat. if provided, should be some sort of count that can be aggregated over time.
  def new_relic_data_point(name, amount=1)
    ::NewRelic::Agent.record_metric(name, amount)
  end

  # trace the execution time of the block.
  def new_relic_block(names, options={}, &block)
    ::NewRelic::Agent::MethodTracer.trace_execution_scoped(names.lines.to_a, options, &block)
  end
end

#Github::Repository.class_eval do
#  include ::NewRelic::Agent::MethodTracer
#
#  class << self
#    add_method_tracer :search_with_github, "Custom/#{self.name}/search"
#  end
#end

ActiveRecord::Base.class_eval do
  include ::NewRelic::Agent::MethodTracer

  after_create do
    new_relic_data_point "ActiveRecord/#{self.class.name}/create"
  end

  after_update do
    new_relic_data_point "ActiveRecord/#{self.class.name}/update"
  end
end
