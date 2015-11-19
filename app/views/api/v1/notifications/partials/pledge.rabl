extends "api/v1/notifications/partials/base"

attribute :amount

child(:fundraiser) { attributes :title, :frontend_path }
