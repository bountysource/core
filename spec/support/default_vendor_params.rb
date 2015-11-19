require 'active_support/concern'

module DefaultVendorParams
  extend ActiveSupport::Concern

  def process_with_vendor_default(action, http_method, params={}, session={}, flash={})
    params = default_params.merge(params)
    process_without_vendor_default(action, http_method, params, session, flash)
  end

  included do
    let(:default_params) { {vendor_string: 'bountysource'} }
    alias_method_chain :process, :vendor_default
  end
end

RSpec.configure do |config|
  config.include(DefaultVendorParams, :type => :controller)
end
