# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180404095942) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "access_tokens", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.string "token", null: false
    t.string "remote_ip"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_access_tokens_on_person_id"
    t.index ["token"], name: "index_access_tokens_on_token", unique: true
  end

  create_table "accounts", id: :serial, force: :cascade do |t|
    t.string "type", default: "Account", null: false
    t.string "description", default: "", null: false
    t.string "currency", default: "USD", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "owner_id"
    t.string "owner_type"
    t.boolean "standalone", default: false
    t.index ["owner_id"], name: "index_accounts_on_item_id"
    t.index ["owner_type"], name: "index_accounts_on_item_type"
    t.index ["type"], name: "index_accounts_on_type"
  end

  create_table "activity_logs", id: :serial, force: :cascade do |t|
    t.integer "person_id"
    t.integer "issue_id"
    t.integer "tracker_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.integer "lurker_id"
    t.index ["created_at"], name: "index_activity_logs_on_created_at"
  end

  create_table "addresses", id: :serial, force: :cascade do |t|
    t.integer "person_id"
    t.string "name"
    t.string "address1"
    t.string "address2"
    t.string "address3"
    t.string "city"
    t.string "state"
    t.string "postal_code"
    t.string "country"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["person_id"], name: "index_addresses_on_person_id"
  end

  create_table "admin_stats", id: :serial, force: :cascade do |t|
    t.text "raw_json", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "badge_caches", id: :serial, force: :cascade do |t|
    t.string "url", null: false
    t.text "raw_xml", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["url"], name: "index_badge_caches_on_url", unique: true
  end

  create_table "bounties", id: :serial, force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.integer "person_id"
    t.integer "issue_id", null: false
    t.string "status", limit: 12, default: "active", null: false
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "paid_at"
    t.boolean "anonymous", default: false, null: false
    t.string "owner_type"
    t.integer "owner_id"
    t.string "bounty_expiration"
    t.string "upon_expiration"
    t.string "promotion"
    t.datetime "acknowledged_at"
    t.boolean "tweet", default: false, null: false
    t.boolean "featured", default: false, null: false
    t.index ["anonymous"], name: "index_bounties_on_anonymous"
    t.index ["issue_id"], name: "index_bounties_on_github_issue_id"
    t.index ["owner_id"], name: "index_bounties_on_owner_id"
    t.index ["owner_type"], name: "index_bounties_on_owner_type"
    t.index ["person_id"], name: "index_bounties_on_patron_id"
    t.index ["status"], name: "index_bounties_on_status"
  end

  create_table "bounty_claim_events", id: :serial, force: :cascade do |t|
    t.string "type", null: false
    t.integer "bounty_claim_id", null: false
    t.integer "person_id"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bounty_claim_id"], name: "index_bounty_claim_events_on_bounty_claim_id"
    t.index ["person_id"], name: "index_bounty_claim_events_on_person_id"
  end

  create_table "bounty_claim_responses", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "bounty_claim_id", null: false
    t.boolean "value"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "anonymous", default: false, null: false
    t.integer "owner_id"
    t.string "owner_type"
    t.index ["bounty_claim_id"], name: "index_bounty_claim_responses_on_bounty_claim_id"
    t.index ["person_id", "bounty_claim_id"], name: "index_bounty_claim_responses_on_person_id_and_bounty_claim_id", unique: true
  end

  create_table "bounty_claims", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "issue_id", null: false
    t.integer "number"
    t.string "code_url"
    t.text "description"
    t.boolean "collected"
    t.boolean "disputed", default: false, null: false
    t.boolean "paid_out", default: false, null: false
    t.boolean "rejected", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "amount", default: "0.0", null: false
    t.index ["issue_id"], name: "index_bounty_claims_on_issue_id"
    t.index ["person_id", "issue_id"], name: "index_bounty_claims_on_person_id_and_issue_id", unique: true
    t.index ["person_id"], name: "index_bounty_claims_on_person_id"
  end

  create_table "cash_outs", id: :serial, force: :cascade do |t|
    t.string "type", null: false
    t.integer "person_id", null: false
    t.integer "address_id", null: false
    t.integer "mailing_address_id"
    t.string "bitcoin_address"
    t.string "paypal_address"
    t.string "remote_ip"
    t.string "user_agent"
    t.decimal "amount"
    t.datetime "sent_at"
    t.boolean "us_citizen"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text "serialized_address"
    t.text "serialized_mailing_address"
    t.decimal "fee"
    t.decimal "fee_adjustment"
    t.string "ripple_address"
    t.string "mastercoin_address"
    t.boolean "is_refund", default: false, null: false
    t.integer "account_id", null: false
    t.integer "quickbooks_transaction_id"
    t.boolean "is_fraud", default: false, null: false
    t.index ["address_id"], name: "index_cash_outs_on_address_id"
    t.index ["amount"], name: "index_cash_outs_on_amount"
    t.index ["bitcoin_address"], name: "index_cash_outs_on_bitcoin_address"
    t.index ["mailing_address_id"], name: "index_cash_outs_on_mailing_address_id"
    t.index ["paypal_address"], name: "index_cash_outs_on_paypal_address"
    t.index ["person_id"], name: "index_cash_outs_on_person_id"
    t.index ["sent_at"], name: "index_cash_outs_on_sent_at"
    t.index ["type"], name: "index_cash_outs_on_type"
    t.index ["us_citizen"], name: "index_cash_outs_on_us_citizen"
  end

  create_table "comments", id: :serial, force: :cascade do |t|
    t.integer "issue_id", null: false
    t.integer "remote_id", null: false
    t.datetime "synced_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "sync_in_progress", default: false, null: false
    t.text "body_html"
    t.integer "author_linked_account_id"
    t.string "author_name"
    t.text "body_markdown"
    t.index ["author_linked_account_id"], name: "index_comments_on_author_linked_account_id"
    t.index ["issue_id"], name: "index_comments_on_issue_id"
  end

  create_table "currencies", id: :serial, force: :cascade do |t|
    t.string "type", null: false
    t.decimal "value", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["type"], name: "index_currencies_on_type"
    t.index ["value"], name: "index_currencies_on_value"
  end

  create_table "delayed_jobs", id: :serial, force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "developer_goals", id: :serial, force: :cascade do |t|
    t.boolean "notified", default: false
    t.integer "amount", null: false
    t.integer "person_id", null: false
    t.integer "issue_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["issue_id"], name: "index_developer_goals_on_issue_id"
    t.index ["person_id", "issue_id"], name: "index_developer_goals_on_person_id_and_issue_id", unique: true
    t.index ["person_id"], name: "index_developer_goals_on_person_id"
  end

  create_table "disputes", id: :serial, force: :cascade do |t|
    t.integer "solution_id", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "closed", default: false
    t.integer "number"
    t.integer "person_id", null: false
    t.text "comment"
    t.index ["closed"], name: "index_disputes_on_closed"
    t.index ["number", "solution_id"], name: "index_disputes_on_number_and_solution_id", unique: true
    t.index ["person_id"], name: "index_disputes_on_person_id"
  end

  create_table "events", id: :serial, force: :cascade do |t|
    t.string "slug", null: false
    t.string "title"
    t.string "url"
    t.integer "issue_ids", default: [], null: false, array: true
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "subtitle"
    t.index ["slug"], name: "index_events_on_slug", unique: true
  end

  create_table "follow_relations", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "item_id", null: false
    t.string "item_type", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id", "item_id"], name: "index_follow_relations_on_person_id_and_item_id", unique: true
  end

  create_table "fundraiser_questions", id: :serial, force: :cascade do |t|
    t.integer "fundraiser_id"
    t.string "question"
    t.string "answer"
    t.integer "rank"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "fundraiser_tracker_relations", id: :serial, force: :cascade do |t|
    t.integer "fundraiser_id", null: false
    t.integer "tracker_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["fundraiser_id", "tracker_id"], name: "index_fundraiser_tracker_relations_on_ids", unique: true
  end

  create_table "fundraisers", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.boolean "published", default: false, null: false
    t.string "title"
    t.string "homepage_url"
    t.string "repo_url"
    t.text "description"
    t.text "about_me"
    t.bigint "funding_goal", default: 100
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "total_pledged", precision: 10, scale: 2, default: "0.0", null: false
    t.boolean "featured", default: false, null: false
    t.string "short_description"
    t.integer "days_open", default: 30
    t.datetime "ends_at"
    t.datetime "breached_at"
    t.boolean "completed", default: false, null: false
    t.boolean "breached", default: false, null: false
    t.boolean "featured_at"
    t.boolean "hidden", default: false, null: false
    t.string "cloudinary_id"
    t.integer "team_id"
    t.integer "tracker_id"
    t.index ["breached"], name: "index_fundraisers_on_breached"
    t.index ["completed"], name: "index_fundraisers_on_completed"
    t.index ["ends_at"], name: "index_fundraisers_on_ends_at"
    t.index ["featured"], name: "index_fundraisers_on_featured"
    t.index ["featured_at"], name: "index_fundraisers_on_featured_at"
    t.index ["hidden"], name: "index_fundraisers_on_hidden"
    t.index ["person_id"], name: "index_fundraisers_on_person_id"
    t.index ["published"], name: "index_fundraisers_on_published"
  end

  create_table "github_events", id: :serial, force: :cascade do |t|
    t.integer "issue_id", null: false
    t.integer "remote_id", null: false
    t.text "raw", null: false
    t.datetime "synced_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "sync_in_progress", default: false, null: false
  end

  create_table "github_stargazers", id: :serial, force: :cascade do |t|
    t.integer "linked_account_id", null: false
    t.integer "tracker_id", null: false
    t.boolean "stargazer"
    t.boolean "subscriber"
    t.boolean "forker"
    t.datetime "synced_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "google_wallet_items", id: :serial, force: :cascade do |t|
    t.string "order_id", null: false
    t.text "jwt", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "issue_rank_caches", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "issue_id", null: false
    t.integer "rank", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id", "issue_id"], name: "index_issue_rank_caches_on_person_id_and_issue_id", unique: true
  end

  create_table "issue_ranks", id: :serial, force: :cascade do |t|
    t.string "type", null: false
    t.integer "issue_id", null: false
    t.integer "rank", default: 0, null: false
    t.integer "person_id"
    t.integer "team_id"
    t.integer "linked_account_id"
    t.datetime "last_synced_at"
    t.datetime "last_event_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "excluded", default: false, null: false
    t.index ["issue_id"], name: "index_issue_ranks_on_issue_id"
    t.index ["last_event_created_at"], name: "index_issue_ranks_on_last_event_created_at"
    t.index ["linked_account_id"], name: "index_issue_ranks_on_linked_account_id"
    t.index ["person_id"], name: "index_issue_ranks_on_person_id"
    t.index ["rank"], name: "index_issue_ranks_on_rank"
    t.index ["team_id"], name: "index_issue_ranks_on_team_id"
    t.index ["type"], name: "index_issue_ranks_on_type"
  end

  create_table "issue_suggestion_rewards", id: :serial, force: :cascade do |t|
    t.integer "issue_suggestion_id", null: false
    t.integer "person_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "issue_suggestions", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "team_id", null: false
    t.integer "issue_id", null: false
    t.text "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "can_solve", default: false, null: false
    t.datetime "thanked_at"
    t.datetime "rejected_at"
    t.text "rejection_reason"
  end

  create_table "issues", id: :serial, force: :cascade do |t|
    t.integer "github_pull_request_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "number"
    t.string "url", null: false
    t.text "title"
    t.string "labels"
    t.boolean "code", default: false
    t.string "state"
    t.text "body"
    t.datetime "remote_updated_at"
    t.integer "remote_id"
    t.integer "tracker_id"
    t.integer "solution_id"
    t.boolean "featured", default: false, null: false
    t.datetime "remote_created_at"
    t.datetime "synced_at"
    t.integer "comment_count", default: 0
    t.boolean "sync_in_progress", default: false, null: false
    t.decimal "bounty_total", precision: 10, scale: 2, default: "0.0", null: false
    t.string "type", default: "Issue", null: false
    t.string "remote_type"
    t.string "priority"
    t.string "milestone"
    t.boolean "can_add_bounty", default: false, null: false
    t.integer "accepted_bounty_claim_id"
    t.string "author_name"
    t.string "owner"
    t.boolean "paid_out", default: false, null: false
    t.integer "participants_count"
    t.integer "thumbs_up_count"
    t.integer "votes_count"
    t.integer "watchers_count"
    t.string "severity"
    t.boolean "delta", default: true, null: false
    t.integer "author_linked_account_id"
    t.boolean "solution_started", default: false, null: false
    t.text "body_markdown"
    t.datetime "deleted_at"
    t.index ["author_linked_account_id"], name: "index_issues_partial_author_linked_account_id", where: "(author_linked_account_id IS NOT NULL)"
    t.index ["bounty_total"], name: "index_issues_partial_bounty_total", where: "(bounty_total > (0)::numeric)"
    t.index ["comment_count"], name: "index_issues_on_comment_count"
    t.index ["delta"], name: "index_issues_on_delta"
    t.index ["featured"], name: "index_issues_on_featured"
    t.index ["remote_id"], name: "index_issues_on_remote_id"
    t.index ["solution_started"], name: "index_issues_on_solution_started"
    t.index ["thumbs_up_count"], name: "index_issues_partial_thumbs_up_count", where: "(COALESCE(thumbs_up_count, 0) > 0)"
    t.index ["tracker_id", "bounty_total"], name: "index_issues_on_tracker_id_and_bounty_total"
    t.index ["type"], name: "index_issues_on_type"
    t.index ["url"], name: "index_issues_on_url", unique: true
    t.index ["votes_count"], name: "index_issues_on_votes_count"
    t.index ["watchers_count"], name: "index_issues_on_watchers_count"
  end

  create_table "language_person_relations", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "language_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "active", default: true, null: false
    t.index ["language_id"], name: "index_language_person_relations_on_language_id"
    t.index ["person_id", "language_id"], name: "index_language_person_relations_on_person_id_and_language_id", unique: true
    t.index ["person_id"], name: "index_language_person_relations_on_person_id"
  end

  create_table "languages", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "search_weight"
    t.index ["name"], name: "index_languages_on_name", unique: true
  end

  create_table "linked_accounts", id: :serial, force: :cascade do |t|
    t.integer "person_id"
    t.string "type"
    t.bigint "uid"
    t.string "login"
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "oauth_token"
    t.string "oauth_secret"
    t.string "permissions"
    t.datetime "synced_at"
    t.boolean "sync_in_progress", default: false
    t.integer "followers", default: 0
    t.integer "following", default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal "account_balance", precision: 10, scale: 2, default: "0.0"
    t.boolean "anonymous", default: false, null: false
    t.string "company"
    t.string "location"
    t.text "bio"
    t.string "cloudinary_id"
    t.datetime "deleted_at"
    t.index ["anonymous"], name: "index_linked_accounts_on_anonymous"
    t.index ["email"], name: "index_linked_accounts_on_email", where: "(email IS NOT NULL)"
    t.index ["login"], name: "index_linked_accounts_on_login"
    t.index ["person_id"], name: "index_linked_accounts_on_person_id"
    t.index ["uid", "type"], name: "index_linked_accounts_on_uid_and_type", unique: true
    t.index ["uid"], name: "index_linked_accounts_on_uid"
  end

  create_table "lurkers", id: :serial, force: :cascade do |t|
    t.string "remote_ip", null: false
    t.string "user_agent", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["remote_ip", "user_agent"], name: "index_lurkers_on_remote_ip_and_user_agent", unique: true
  end

  create_table "merged_models", id: :serial, force: :cascade do |t|
    t.integer "good_id", null: false
    t.integer "bad_id", null: false
    t.string "bad_type", null: false
    t.datetime "created_at", null: false
    t.index ["bad_id", "bad_type"], name: "index_merged_models_on_bad_id_and_bad_type", unique: true
  end

  create_table "milestones", id: :serial, force: :cascade do |t|
    t.integer "fundraiser_id", null: false
    t.datetime "delivery_at"
    t.integer "percentage_of_project"
    t.string "description", null: false
    t.integer "completed_percentage", null: false
    t.boolean "optional", default: false, null: false
    t.integer "rank", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "mixpanel_aliases", id: :serial, force: :cascade do |t|
    t.string "distinct_id", null: false
    t.integer "person_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["distinct_id"], name: "index_mixpanel_aliases_on_distinct_id", unique: true
    t.index ["person_id"], name: "index_mixpanel_aliases_on_person_id"
  end

  create_table "mixpanel_events", id: :serial, force: :cascade do |t|
    t.integer "person_id"
    t.string "distinct_id"
    t.string "event"
    t.datetime "created_at"
    t.json "payload"
    t.index ["created_at"], name: "index_mixpanel_events_on_created_at"
    t.index ["distinct_id"], name: "index_mixpanel_events_on_distinct_id"
    t.index ["person_id"], name: "index_mixpanel_events_on_person_id"
  end

  create_table "orders", id: :serial, force: :cascade do |t|
    t.string "type", default: "Order", null: false
    t.string "serial", null: false
    t.string "order_number", null: false
    t.string "buyer_id", null: false
    t.datetime "processed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payment_method_temporaries", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.string "paypal_token", null: false
    t.json "data", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["paypal_token"], name: "index_payment_method_temporaries_on_paypal_token"
  end

  create_table "payment_methods", id: :serial, force: :cascade do |t|
    t.string "type", null: false
    t.integer "person_id", null: false
    t.json "data", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "payment_notification_logs", id: :serial, force: :cascade do |t|
    t.string "processor", null: false
    t.string "notification_type"
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payment_notifications", id: :serial, force: :cascade do |t|
    t.string "type", null: false
    t.string "txn_id"
    t.text "raw_post"
    t.integer "order_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "secret_matched"
    t.integer "payment_method_id"
    t.json "raw_json"
    t.index ["order_id"], name: "index_payment_notifications_on_order_id"
    t.index ["txn_id"], name: "index_payment_notifications_on_txn_id"
    t.index ["type"], name: "index_payment_notifications_on_type"
  end

  create_table "paypal_ipns", id: :serial, force: :cascade do |t|
    t.text "raw_post", null: false
    t.string "txn_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "payment_processed_at"
    t.string "payment_type"
    t.boolean "pending", default: false, null: false
    t.boolean "processed", default: false, null: false
    t.boolean "is_return", default: false, null: false
    t.index ["is_return"], name: "index_paypal_ipns_on_is_return"
    t.index ["payment_type"], name: "index_paypal_ipns_on_payment_type"
    t.index ["pending"], name: "index_paypal_ipns_on_pending"
    t.index ["processed"], name: "index_paypal_ipns_on_processed"
    t.index ["txn_id"], name: "index_paypal_ipns_on_txn_id"
  end

  create_table "people", id: :serial, force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "display_name"
    t.string "email", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "buyer_id"
    t.string "password_digest"
    t.boolean "account_completed", default: false
    t.string "paypal_email"
    t.datetime "last_seen_at"
    t.datetime "last_bulk_mailed_at"
    t.boolean "admin", default: false
    t.text "bio"
    t.string "location"
    t.string "url"
    t.string "company"
    t.string "public_email"
    t.datetime "accepted_terms_at"
    t.string "cloudinary_id"
    t.boolean "deleted", default: false, null: false
    t.boolean "profile_completed", default: false, null: false
    t.integer "shopping_cart_id"
    t.string "stripe_customer_id"
    t.datetime "suspended_at"
    t.boolean "bounty_hunter"
    t.integer "quickbooks_vendor_id"
    t.string "reset_digest"
    t.datetime "reset_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.index ["email"], name: "index_people_on_email", unique: true
    t.index ["shopping_cart_id"], name: "index_people_on_shopping_cart_id"
  end

  create_table "person_relations", id: :serial, force: :cascade do |t|
    t.string "type", null: false
    t.integer "person_id", null: false
    t.integer "target_person_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_person_relations_on_person_id"
    t.index ["target_person_id"], name: "index_person_relations_on_target_person_id"
    t.index ["type", "person_id", "target_person_id"], name: "index_person_relations_on_type_and_people", unique: true
  end

  create_table "pledge_survey_responses", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "reward_id", null: false
    t.text "survey_response", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_pledge_survey_responses_on_person_id"
    t.index ["reward_id"], name: "index_pledge_survey_responses_on_reward_id"
  end

  create_table "pledges", id: :serial, force: :cascade do |t|
    t.integer "fundraiser_id"
    t.integer "person_id"
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "status", limit: 12, default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "reward_id"
    t.text "survey_response"
    t.boolean "anonymous", default: false, null: false
    t.string "owner_type"
    t.integer "owner_id"
    t.index ["anonymous"], name: "index_pledges_on_anonymous"
    t.index ["owner_id"], name: "index_pledges_on_owner_id"
    t.index ["owner_type"], name: "index_pledges_on_owner_type"
    t.index ["status"], name: "index_pledges_on_status"
  end

  create_table "postbacks", id: :serial, force: :cascade do |t|
    t.string "namespace"
    t.string "method"
    t.string "url"
    t.text "raw_post"
    t.text "headers"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "proposals", id: :serial, force: :cascade do |t|
    t.integer "request_for_proposal_id", null: false
    t.integer "person_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.integer "estimated_work"
    t.string "bio", limit: 1000
    t.string "state", default: "pending"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "completed_by"
    t.text "team_notes"
    t.index ["amount"], name: "index_proposals_on_amount"
    t.index ["person_id", "request_for_proposal_id"], name: "index_proposals_on_person_id_and_request_for_proposal_id", unique: true
    t.index ["person_id"], name: "index_proposals_on_person_id"
    t.index ["request_for_proposal_id"], name: "index_proposals_on_request_for_proposal_id"
  end

  create_table "public_stats", id: :serial, force: :cascade do |t|
    t.text "daily_json", null: false
    t.text "weekly_json", null: false
    t.text "monthly_json", null: false
    t.text "quarterly_json", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "quickbooks_transactions", id: :integer, default: nil, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "quickbooks_vendors", id: :integer, default: nil, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "recommendation_events", id: :serial, force: :cascade do |t|
    t.integer "person_id"
    t.string "event"
    t.integer "issue_id"
    t.datetime "created_at"
    t.index ["person_id", "issue_id", "event"], name: "index_recommendation_events_on_person_id_and_issue_id_and_event"
  end

  create_table "request_for_proposals", id: :serial, force: :cascade do |t|
    t.integer "issue_id"
    t.decimal "budget", precision: 10, scale: 2
    t.date "due_date"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "person_id", null: false
    t.string "state", default: "pending"
    t.string "abstract", limit: 1000
    t.index ["budget"], name: "index_request_for_proposals_on_budget"
    t.index ["issue_id"], name: "index_request_for_proposals_on_issue_id"
    t.index ["person_id"], name: "index_request_for_proposals_on_person_id"
  end

  create_table "rewards", id: :serial, force: :cascade do |t|
    t.integer "fundraiser_id", null: false
    t.text "description", null: false
    t.datetime "delivered_at"
    t.integer "limited_to"
    t.string "timezone"
    t.string "vanity_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "amount"
    t.boolean "sold_out", default: false
    t.text "fulfillment_details"
    t.decimal "merchandise_fee", precision: 10, scale: 2
    t.index ["sold_out"], name: "index_rewards_on_sold_out"
  end

  create_table "saved_search_tabs", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "query", null: false
    t.integer "person_id", null: false
    t.boolean "locked", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "searches", id: :serial, force: :cascade do |t|
    t.string "query", null: false
    t.integer "person_id"
    t.datetime "created_at", null: false
    t.text "params", default: "--- {}\n"
  end

  create_table "sent_emails", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.string "template", null: false
    t.text "options", default: "--- {}\n", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "shopping_carts", id: :serial, force: :cascade do |t|
    t.integer "person_id"
    t.text "items", default: "[]", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "order_id"
    t.string "uid"
    t.integer "payment_method_id"
    t.text "status", default: "draft", null: false
    t.index ["order_id"], name: "index_shopping_carts_on_order_id"
    t.index ["status"], name: "index_shopping_carts_on_status"
    t.index ["uid"], name: "index_shopping_carts_on_uid"
  end

  create_table "shorts", id: :serial, force: :cascade do |t|
    t.string "slug", null: false
    t.string "destination", null: false
    t.datetime "created_at", null: false
    t.index ["slug"], name: "index_shorts_on_slug", unique: true
  end

  create_table "solution_events", id: :serial, force: :cascade do |t|
    t.integer "solution_id", null: false
    t.string "type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["solution_id"], name: "index_solution_events_on_solution_id"
    t.index ["type"], name: "index_solution_events_on_type"
  end

  create_table "solutions", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "issue_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "note"
    t.string "url"
    t.datetime "completion_date"
    t.string "status", default: "stopped", null: false
    t.index ["issue_id"], name: "index_solutions_on_issue_id"
    t.index ["person_id", "issue_id"], name: "index_solutions_on_person_id_and_issue_id", unique: true
    t.index ["person_id"], name: "index_solutions_on_person_id"
  end

  create_table "splits", id: :serial, force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "status", default: "approved", null: false
    t.integer "account_id", null: false
    t.integer "transaction_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "currency", default: "USD", null: false
    t.integer "item_id"
    t.string "item_type"
    t.integer "dirty", default: 0, null: false
    t.index ["account_id"], name: "index_splits_on_account_id"
    t.index ["transaction_id"], name: "index_splits_on_transaction_id"
  end

  create_table "splits_backup", id: false, force: :cascade do |t|
    t.integer "id"
    t.decimal "amount", precision: 10, scale: 2
    t.string "memo"
    t.string "status"
    t.integer "account_id"
    t.integer "transaction_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "currency"
    t.integer "item_id"
    t.string "item_type"
    t.integer "dirty"
  end

  create_table "support_level_payments", id: :serial, force: :cascade do |t|
    t.integer "support_level_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.date "period_starts_at"
    t.date "period_ends_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "refunded_at"
    t.index ["support_level_id"], name: "index_support_level_payments_on_support_level_id"
  end

  create_table "support_levels", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "team_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "status", null: false
    t.string "owner_type"
    t.integer "owner_id"
    t.integer "payment_method_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "reward_id"
    t.date "last_invoice_starts_at"
    t.date "last_invoice_ends_at"
    t.datetime "canceled_at"
    t.index ["person_id"], name: "index_support_levels_on_person_id"
    t.index ["reward_id"], name: "index_support_levels_on_reward_id"
    t.index ["team_id"], name: "index_support_levels_on_team_id"
  end

  create_table "support_offering_rewards", id: :serial, force: :cascade do |t|
    t.integer "support_offering_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "title"
    t.text "description"
    t.integer "active_support_levels_count", default: 0, null: false
    t.datetime "deleted_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["support_offering_id"], name: "index_support_offering_rewards_on_support_offering_id"
  end

  create_table "support_offerings", id: :serial, force: :cascade do |t|
    t.integer "team_id", null: false
    t.string "subtitle"
    t.text "body_markdown"
    t.string "youtube_video_url"
    t.json "goals"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.json "extra"
    t.index ["team_id"], name: "index_support_offerings_on_team_id", unique: true
  end

  create_table "tag_relations", id: :serial, force: :cascade do |t|
    t.integer "parent_id", null: false
    t.string "parent_type", null: false
    t.integer "child_id", null: false
    t.string "child_type", null: false
    t.integer "weight", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["child_id", "child_type"], name: "index_tag_relations_on_child_id_and_child_type"
    t.index ["parent_id", "parent_type", "child_id", "child_type"], name: "index_tag_relations_on_child_and_parent", unique: true
  end

  create_table "tag_votes", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "value", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "tag_relation_id", null: false
    t.index ["tag_relation_id", "person_id"], name: "index_tag_votes_on_tag_relation_id_and_person_id", unique: true
  end

  create_table "tags", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "image_url"
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "takedowns", id: :serial, force: :cascade do |t|
    t.integer "linked_account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "team_activity_inclusions", id: :serial, force: :cascade do |t|
    t.integer "parent_team_id", null: false
    t.integer "child_team_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["child_team_id"], name: "index_team_activity_inclusions_on_child_team_id"
    t.index ["parent_team_id"], name: "index_team_activity_inclusions_on_parent_team_id"
  end

  create_table "team_bounty_hunters", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "team_id", null: false
    t.datetime "opted_out_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "team_claims", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "team_id", null: false
    t.text "claim_notes"
    t.text "rejected_notes"
    t.datetime "accepted_at"
    t.datetime "rejected_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "team_invites", id: :serial, force: :cascade do |t|
    t.integer "team_id", null: false
    t.string "token", null: false
    t.string "email"
    t.boolean "admin", default: false, null: false
    t.boolean "developer", default: false, null: false
    t.boolean "public", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email", "team_id"], name: "index_team_invites_on_email_and_team_id", unique: true
    t.index ["email"], name: "index_team_invites_on_email"
    t.index ["team_id"], name: "index_team_invites_on_team_id"
  end

  create_table "team_member_relations", id: :serial, force: :cascade do |t|
    t.integer "team_id", null: false
    t.integer "person_id"
    t.boolean "admin", default: false, null: false
    t.boolean "developer", default: false, null: false
    t.boolean "public", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "invited_by_person_id"
    t.decimal "budget"
    t.decimal "balance"
    t.string "owner_type"
    t.integer "owner_id"
    t.boolean "member", default: true, null: false
    t.index ["owner_id"], name: "index_team_member_relations_on_owner_id"
    t.index ["owner_type"], name: "index_team_member_relations_on_owner_type"
    t.index ["person_id", "team_id"], name: "index_team_member_relations_on_person_id_and_team_id", unique: true
    t.index ["person_id"], name: "index_team_member_relations_on_person_id"
    t.index ["team_id"], name: "index_team_member_relations_on_team_id"
  end

  create_table "team_payins", id: :serial, force: :cascade do |t|
    t.integer "team_id", null: false
    t.decimal "amount", null: false
    t.integer "person_id"
    t.boolean "consumed", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "owner_type"
    t.integer "owner_id"
    t.boolean "from_member", default: false
    t.datetime "refunded_at"
    t.index ["amount"], name: "index_team_payins_on_amount"
    t.index ["owner_type", "owner_id"], name: "index_team_payins_on_owner_type_and_owner_id"
    t.index ["person_id"], name: "index_team_payins_on_person_id"
    t.index ["refunded_at"], name: "index_team_payins_on_refunded_at", where: "(refunded_at IS NOT NULL)"
    t.index ["team_id"], name: "index_team_payins_on_team_id"
  end

  create_table "team_tracker_relations", id: :serial, force: :cascade do |t|
    t.integer "team_id", null: false
    t.integer "tracker_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["team_id", "tracker_id"], name: "index_team_tracker_relations_on_team_id_and_tracker_id", unique: true
    t.index ["team_id"], name: "index_team_tracker_relations_on_team_id"
    t.index ["tracker_id"], name: "index_team_tracker_relations_on_tracker_id"
  end

  create_table "team_updates", id: :serial, force: :cascade do |t|
    t.integer "number"
    t.string "title"
    t.text "body"
    t.boolean "published", default: false, null: false
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "team_id", null: false
    t.json "mailing_lists"
    t.index ["published"], name: "index_team_updates_on_published"
    t.index ["team_id", "number"], name: "index_team_updates_on_team_id_and_number", unique: true
  end

  create_table "teams", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug"
    t.string "url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "cloudinary_id"
    t.text "bio"
    t.boolean "featured", default: false, null: false
    t.integer "linked_account_id"
    t.boolean "accepts_public_payins", default: false, null: false
    t.boolean "rfp_enabled", default: false, null: false
    t.decimal "activity_total", default: "0.0", null: false
    t.boolean "bounties_disabled"
    t.decimal "support_level_sum", precision: 10, scale: 2
    t.integer "support_level_count"
    t.text "homepage_markdown"
    t.integer "homepage_featured"
    t.boolean "accepts_issue_suggestions", default: false, null: false
    t.text "new_issue_suggestion_markdown"
    t.text "bounty_search_markdown"
    t.text "resources_markdown"
    t.decimal "monthly_contributions_sum", precision: 10, scale: 2
    t.integer "monthly_contributions_count"
    t.boolean "can_email_stargazers", default: false, null: false
    t.decimal "previous_month_contributions_sum", precision: 10, scale: 2
    t.index ["activity_total"], name: "index_teams_on_activity_total"
    t.index ["homepage_featured"], name: "index_teams_on_homepage_featured"
    t.index ["linked_account_id"], name: "index_teams_on_linked_account_id"
    t.index ["slug"], name: "index_companies_on_slug", unique: true
  end

  create_table "thumbs", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.string "item_type", null: false
    t.integer "item_id", null: false
    t.boolean "explicit", null: false
    t.boolean "downvote", null: false
    t.integer "comment_id"
    t.datetime "thumbed_at", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["person_id", "item_id", "item_type"], name: "index_thumbs_on_person_id_and_item_id_and_item_type", unique: true
  end

  create_table "trac_users", id: :serial, force: :cascade do |t|
    t.string "login"
    t.datetime "synced_at"
    t.boolean "sync_in_progress"
    t.integer "repository_id"
    t.index ["login"], name: "index_trac_users_on_login"
  end

  create_table "tracker_donations", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "tracker_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tracker_language_relations", id: :serial, force: :cascade do |t|
    t.integer "tracker_id", null: false
    t.integer "language_id", null: false
    t.integer "bytes"
    t.datetime "synced_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tracker_id", "language_id"], name: "index_tracker_language_relations_on_tracker_id_and_language_id", unique: true
  end

  create_table "tracker_person_relations", id: :serial, force: :cascade do |t|
    t.integer "tracker_id", null: false
    t.integer "person_id", null: false
    t.boolean "can_edit", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tracker_id", "person_id"], name: "index_tracker_person_relations_on_tracker_id_and_person_id", unique: true
  end

  create_table "tracker_plugin_backups", id: :serial, force: :cascade do |t|
    t.integer "tracker_plugin_id", null: false
    t.integer "issue_id", null: false
    t.text "raw", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["issue_id"], name: "index_tracker_plugin_backups_on_issue_id"
    t.index ["tracker_plugin_id"], name: "index_tracker_plugin_backups_on_tracker_plugin_id"
  end

  create_table "tracker_plugins", id: :serial, force: :cascade do |t|
    t.integer "tracker_id", null: false
    t.boolean "modify_title", default: false, null: false
    t.boolean "add_label", default: false, null: false
    t.boolean "modify_body", default: false, null: false
    t.datetime "synced_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "label_name", default: "bounty", null: false
    t.string "type"
    t.integer "person_id"
    t.string "bounties_accepted_msg"
    t.string "bounty_available_msg"
    t.string "bounty_claimed_msg"
    t.string "label_color", default: "#129e5e", null: false
    t.boolean "locked", default: false, null: false
    t.text "last_error"
    t.datetime "locked_at"
    t.index ["add_label"], name: "index_tracker_plugins_on_add_label"
    t.index ["person_id"], name: "index_tracker_plugins_on_person_id"
    t.index ["synced_at"], name: "index_tracker_plugins_on_synced_at"
    t.index ["tracker_id"], name: "index_tracker_plugins_on_tracker_id", unique: true
  end

  create_table "tracker_rank_caches", id: :serial, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "tracker_id", null: false
    t.integer "rank", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id", "tracker_id"], name: "index_tracker_rank_caches_on_person_id_and_tracker_id", unique: true
  end

  create_table "tracker_relations", id: :serial, force: :cascade do |t|
    t.integer "tracker_id", null: false
    t.integer "linked_account_id", null: false
    t.string "type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["linked_account_id"], name: "index_tracker_relations_on_linked_account_id"
    t.index ["tracker_id"], name: "index_tracker_relations_on_tracker_id"
  end

  create_table "trackers", id: :serial, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "remote_id"
    t.string "url", null: false
    t.string "name", null: false
    t.string "full_name"
    t.boolean "is_fork", default: false
    t.integer "watchers", default: 0, null: false
    t.integer "forks", default: 0
    t.datetime "pushed_at"
    t.text "description"
    t.boolean "featured", default: false, null: false
    t.integer "open_issues", default: 0, null: false
    t.datetime "synced_at"
    t.decimal "project_tax", precision: 9, scale: 4, default: "0.0"
    t.boolean "has_issues", default: true, null: false
    t.boolean "has_wiki", default: false, null: false
    t.boolean "has_downloads", default: false, null: false
    t.boolean "private", default: false, null: false
    t.string "homepage"
    t.boolean "sync_in_progress", default: false, null: false
    t.decimal "bounty_total", precision: 10, scale: 2, default: "0.0", null: false
    t.decimal "account_balance", precision: 10, scale: 2, default: "0.0"
    t.string "type", default: "Tracker", null: false
    t.string "cloudinary_id"
    t.integer "closed_issues", default: 0, null: false
    t.boolean "delta", default: true, null: false
    t.boolean "can_edit", default: true, null: false
    t.text "repo_url"
    t.integer "rank", default: 0, null: false
    t.string "remote_cloudinary_id"
    t.string "remote_name"
    t.text "remote_description"
    t.string "remote_homepage"
    t.integer "remote_language_ids", default: [], array: true
    t.integer "language_ids", default: [], array: true
    t.integer "team_id"
    t.datetime "deleted_at"
    t.index ["bounty_total"], name: "index_trackers_on_bounty_total"
    t.index ["closed_issues"], name: "index_trackers_on_closed_issues"
    t.index ["delta"], name: "index_trackers_on_delta"
    t.index ["open_issues"], name: "index_trackers_on_open_issues"
    t.index ["rank"], name: "index_trackers_on_rank"
    t.index ["remote_id"], name: "index_trackers_on_remote_id"
    t.index ["team_id"], name: "index_trackers_on_team_id"
    t.index ["type"], name: "index_trackers_on_type"
    t.index ["url"], name: "index_trackers_on_url", unique: true
    t.index ["watchers"], name: "index_trackers_on_watchers"
  end

  create_table "transactions", id: :serial, force: :cascade do |t|
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "audited"
    t.string "type", default: "Transaction", null: false
    t.integer "person_id"
    t.integer "checkout_method_id"
    t.decimal "gross"
    t.decimal "items"
    t.decimal "fee", default: "0.0"
    t.decimal "processing_fee", default: "0.0"
    t.decimal "merch_fee", default: "0.0"
    t.decimal "liability", default: "0.0"
    t.index ["checkout_method_id"], name: "index_transactions_on_checkout_method_id"
    t.index ["fee"], name: "index_transactions_on_fees"
    t.index ["gross"], name: "index_transactions_on_gross"
    t.index ["items"], name: "index_transactions_on_items"
    t.index ["liability"], name: "index_transactions_on_liability"
    t.index ["merch_fee"], name: "index_transactions_on_merch_fee"
    t.index ["person_id"], name: "index_transactions_on_person_id"
    t.index ["processing_fee"], name: "index_transactions_on_processing_fee"
  end

  create_table "transactions_backup", id: false, force: :cascade do |t|
    t.integer "id"
    t.text "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "audited"
    t.string "type"
    t.integer "person_id"
    t.integer "checkout_method_id"
    t.integer "number"
    t.decimal "gross"
    t.decimal "items"
    t.decimal "fee"
    t.decimal "processing_fee"
    t.decimal "merch_fee"
    t.decimal "liability"
  end

  create_table "unsubscribes", id: :serial, force: :cascade do |t|
    t.integer "person_id"
    t.integer "linked_account_id"
    t.string "email"
    t.string "category"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["email"], name: "index_unsubscribes_on_email", where: "(email IS NOT NULL)"
    t.index ["linked_account_id"], name: "index_unsubscribes_on_linked_account_id", where: "(linked_account_id IS NOT NULL)"
    t.index ["person_id"], name: "index_unsubscribes_on_person_id", where: "(person_id IS NOT NULL)"
  end

  create_table "versions", id: :serial, force: :cascade do |t|
    t.string "item_type", null: false
    t.integer "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object"
    t.text "object_changes"
    t.integer "person_id"
    t.string "remote_ip"
    t.text "user_agent"
    t.datetime "created_at"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

end
