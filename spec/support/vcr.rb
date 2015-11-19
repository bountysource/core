
VCR.configure do |c|
  c.cassette_library_dir  = Rails.root.join("spec", "vcr")
  c.hook_into :webmock # or :fakeweb
  c.ignore_localhost = true

  # NOTE: default is { record: :once } but this seems to not write some requests
  # first time runs fine but doesn't write requests to .yml so second run fails
  c.default_cassette_options = ENV['CI'] ? { record: :none } : { record: :new_episodes }
end
