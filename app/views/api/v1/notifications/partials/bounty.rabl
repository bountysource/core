extends "api/v1/notifications/partials/base"

attribute :amount
attribute :created_at

child(:issue) do
  attribute :title
  attribute :frontend_path
end
