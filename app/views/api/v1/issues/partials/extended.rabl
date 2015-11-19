attribute :frontend_url
attribute :sanitized_body_html => :body_html

node(:can_respond_to_claims) do |issue|
  issue.can_respond_to_claims?(@person)
end