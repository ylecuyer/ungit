PORT = 8998 + ENV['TEST_ENV_NUMBER'].to_i

ungit_pid = fork do
  if ENV['COVERAGE']
    exec("nyc --clean -r lcov -t coverage/clicktests.#{PORT} --report-dir coverage/clicktests.#{PORT} ./bin/ungit --port #{PORT}")
  else
    exec("./bin/ungit --port #{PORT}")
  end
end
puts "Started ungit with PID #{ungit_pid}"

at_exit do
  Process.kill("TERM", ungit_pid)
  puts "Stopped ungit with PID #{ungit_pid}"
end