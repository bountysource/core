# NOTE: run "heroku run bundle exec flying-sphinx configure" after modifying this file
ThinkingSphinx::Index.define :tracker, :with => :active_record do
  indexes name, :infixes => true
  has '(select count(*) from issues where tracker_id=trackers.id)', as: :issue_count, type: :integer
  has watchers
  has forks
  has open_issues
  has bounty_total

  set_property :field_weights => {
    :name => 20
  }

  set_property :min_infix_len => 4

  set_property :big_document_ids => true
end