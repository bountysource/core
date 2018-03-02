# NOTE: run "heroku run bundle exec flying-sphinx configure" after modifying this file
ThinkingSphinx::Index.define :issue, :with => :active_record do
  indexes title
  indexes body
  indexes tracker(:name), :as => :tracker
  indexes languages(:name), :as => :languages
  has languages(:id), :as => :language_ids
  has tracker(:id), :as => :tracker_ids
  has can_add_bounty
  has paid_out
  has comment_count
  has bounty_total
  has participants_count
  has thumbs_up_count
  has remote_created_at

  where "(#{sanitize_sql(['can_add_bounty', true])} or issues.bounty_total>0)"

  set_property :field_weights => {
    :title => 50,
    :tracker => 25,
    :languages => 5,
    :body => 30
  }

  set_property :big_document_ids => true
end
