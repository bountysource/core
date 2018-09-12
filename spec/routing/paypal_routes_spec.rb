require 'spec_helper'

describe 'routing for paypal' do
  it 'should route to paypal_ipn action' do
    expect(post: "#{Api::Application.config.api_url}payments/paypal_ipn").to route_to(action: 'paypal_ipn', controller: 'payments')
  end

  it 'should route to paypal_return action' do
    expect(get: "#{Api::Application.config.api_url}payments/paypal_return").to route_to(action: 'paypal_return', controller: 'payments')
  end
end
