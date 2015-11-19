child(:comments) do |issue|
  attribute :sanitized_body_html => :body_html
  attribute :created_at
  extends "api/v1/authors/partials/base"
end
