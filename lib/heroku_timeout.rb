# have rack raise an exception if the request goes longer than 20s
Rack::Timeout.timeout = ENV['RACK_TIMEOUT'].to_i if ENV['RACK_TIMEOUT']

# set 10 second timeout on postgres queries
if ENV['POSTGRES_TIMEOUT']
  ActiveRecord::Base.connection.execute("set statement_timeout TO #{ENV['POSTGRES_TIMEOUT'].to_i}s;")
end
