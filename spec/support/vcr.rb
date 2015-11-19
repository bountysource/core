
VCR.configure do |c|
  c.cassette_library_dir  = Rails.root.join("spec", "vcr")
  c.hook_into :webmock # or :fakeweb
  c.ignore_localhost = true

  # NOTE: default is { record: :once } but this seems to not write some requests
  # first time runs fine but doesn't write requests to .yml so second run fails
  c.default_cassette_options = ENV['CI'] ? { record: :none } : { record: :new_episodes }
end

RSpec.configure do |c|
  #c.treat_symbols_as_metadata_keys_with_true_values = true
  c.around(:each) do |example|
    name = example.metadata[:full_description].split(/\s+/, 2).join("/").underscore.gsub(/[^\w\/]+/, "_")
    VCR.use_cassette(name) { example.call }
  end
end
