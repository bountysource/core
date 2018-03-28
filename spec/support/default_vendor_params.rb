# `api-versions` gem turns `Accept` header into params[:vendor_string] == 'bountysource'
# so we need to simulate that here.
module DefaultVendorParams
  def process(action, args)
    if controller_class_name =~ /api\//
      (args[:params] ||= {})[:vendor_string] = 'bountysource'
    end

    super(action, args)
  end
end

RSpec.configure do |config|
  config.prepend(DefaultVendorParams, :type => :controller)
end
