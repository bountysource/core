require 'capybara/rails'
require 'capybara/rspec'
require 'capybara/poltergeist'

# use Thin instead of default Webrick because VCR.eject_cassette below will
# run before all the requests are completed... thin seems to be better?
# Capybara.server do |app, port|
#   require 'rack/handler/thin'
#   Rack::Handler::Thin.run(app, :Port => port)
# end

if ENV['SELENIUM']
  Capybara.default_driver = :selenium
else
  Capybara.default_driver = :poltergeist
end


# Capybara.default_wait_time = 14
#
# if ENV['CI'] == 'true'
#   #Poltergeist listens to it's own wait timer
#   Capybara.register_driver :slow_poltergeist do |app|
#     Capybara::Poltergeist::Driver.new(app, timeout: Capybara.default_wait_time)
#   end
#   Capybara.default_driver = :slow_poltergeist
# else
#   Capybara.default_driver = :selenium
#
#   if ENV['STAND_ALONE']
#     Capybara.run_server = false
#     Capybara.app_host = "http://127.0.0.1:3000"
#   end
# end

# Capybara.register_driver :poltergeist do |app|
#   Capybara::Poltergeist::Driver.new(app, phantomjs_logger: Capybara::Poltergeist::Suppressor.new, timeout: 15 )
# end
