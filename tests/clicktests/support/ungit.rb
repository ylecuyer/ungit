PORT = 8998 + ENV['TEST_ENV_NUMBER'].to_i

ungit_pid = fork do
  exec("./bin/ungit --port #{PORT}")
end
puts "Started ungit with PID #{ungit_pid}"

at_exit do
  Process.kill("TERM", ungit_pid)
  puts "Stopped ungit with PID #{ungit_pid}"
end