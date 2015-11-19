require 'spec_helper'

describe 'routing for coinbase' do
  it 'should route to callback action' do
    expect(post: "#{Api::Application.config.api_url}payments/coinbase/callback").to route_to(action: 'callback', controller: 'coinbase')
  end

  it 'should route to success action' do
    expect(get: "#{Api::Application.config.api_url}payments/coinbase/success").to route_to(action: 'success', controller: 'coinbase')
  end
end
