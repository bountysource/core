# have rack raise an exception if the request goes longer than 20s
Rack::Timeout.timeout = ENV['RACK_TIMEOUT'].to_i if ENV['RACK_TIMEOUT']

# set 10 second timeout on postgres queries
if ENV['POSTGRES_TIMEOUT']
  require "active_record/connection_adapters/postgresql_adapter"
  ActiveRecord::ConnectionAdapters::PostgreSQLAdapter.class_eval do
    private

      def configure_connection_with_timeout
        configure_connection_without_timeout
        execute("SET SESSION statement_timeout TO '#{ENV['POSTGRES_TIMEOUT'].to_i}s'")
      end

      alias_method_chain :configure_connection, :timeout
  end
end