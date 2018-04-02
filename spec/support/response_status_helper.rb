# assert_response that allows individual status codes in the 400 range to be checked.
# vanilla assert_response only allows 404? that's not very useful...
def assert_response(expected)
  expect(response.code.to_i).to eq(Rack::Utils.status_code(expected))
end