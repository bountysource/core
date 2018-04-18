RSpec.shared_examples_for 'a request that converts currency' do
  it 'should render bad request if amount conversion fails' do
    # Currency.stub(:convert).and_raise(StandardError)
    allow(@controller).to receive(:currency_convert).and_raise(described_class::CurrencyConversionError)
    action
    expect(response.status).to eq(400)
  end
end
