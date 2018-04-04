Delayed::Backend::ActiveRecord::Job.logger.level = 1
Delayed::Worker.default_priority = 50
Delayed::Worker.max_attempts = 3

Delayed::Worker.queue_attributes = {
  searchkick: { priority: 100 }
}