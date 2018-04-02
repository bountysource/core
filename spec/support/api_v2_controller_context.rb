RSpec.shared_context 'api v2 controller' do
  let(:params) do
    {}
  end

  before do
    request.headers['HTTP_ACCEPT'] = 'application/vnd.bountysource+json; version=2'
  end
end
