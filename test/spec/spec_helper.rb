require "rspec"
require "watir-webdriver"

RSpec.configure do |config|
  config.before(:all) do
    @browser ||= Watir::Browser.new :chrome, :switches => %w[--ignore-certificate-errors --disable-popup-blocking --disable-translate]

    # add a navigate method for scope.js routes
    class << @browser
      def goto_route(route)
        goto "https://www-qa.bountysource.com/#{route}"
      end
    end
  end

  config.after(:all) do
    @browser.close
  end
end