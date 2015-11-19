if Rails.env.development? && ENV['DEBUGGER']
  begin
    Debugger.start_remote
    Debugger.settings[:autoeval] = true
    puts "=> Debugger enabled.  Command to connect: rdebug -c"
  rescue => e
    puts "=> ERROR: Debugger not enabled (#{e})"
  end
end

