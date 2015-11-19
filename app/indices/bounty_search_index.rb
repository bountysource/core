# NOTE: run "heroku run bundle exec flying-sphinx configure" after modifying this file
ThinkingSphinx::Index.define( :issue, :name => "bounty_search", :with => :active_record) do
  indexes title
  indexes body
  indexes tracker(:name), :as => :tracker
  indexes languages(:name), :as => :languages
  has bounty_total
  has languages(:id), :as => :language_ids
  has tracker(:id), :as => :tracker_ids
  has '(select count(*) from bounties where issue_id=issues.id)', :as => :backer_count, type: :integer
  has '(select min(created_at) from bounties where issue_id=issues.id  )', :as => :earliest_bounty, type: :timestamp
  has participants_count
  has thumbs_up_count
  has remote_created_at


  where("issues.id IN (SELECT DISTINCT bounties.issue_id FROM bounties) AND issues.bounty_total > 0 AND issues.paid_out = 'false'")


  set_property :field_weights => {
    :title => 50,
    :tracker => 25,
    :languages => 5,
    :body => 1
  }
end
