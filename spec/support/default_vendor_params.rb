# require 'active_support/concern'
#
# module DefaultVendorParams
#   def process(action, http_method, params={}, session={}, flash={})
#     params = { vendor_string: 'bountysource' }.merge(params)
#     super(action, http_method, params, session, flash)
#   end
# end
#
# RSpec.configure do |config|
#   config.prepend(DefaultVendorParams, :type => :controller)
# end
