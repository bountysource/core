namespace :cache do
  desc "Clearing Rails cache"
  task :clear do
    Rails.cache.clear
  end
end

