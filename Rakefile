require "bundler"
Bundler.setup

require "jasmine"

load 'jasmine/tasks/jasmine.rake'

task :default => "jasmine:ci"

desc "Build TwitTwilio"
task :build do
  require "sprockets"
  environment = Sprockets::Environment.new
  environment.append_path 'src'
  environment.append_path 'vendor'
  environment["twit_twilio"].write_to("build/twit_twilio.js")
end
