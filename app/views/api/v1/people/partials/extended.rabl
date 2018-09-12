attribute :first_name
attribute :last_name
attribute :email
attribute :last_seen_at
attribute :updated_at
attribute :paypal_email
node(:has_verified_wallet){ |person| person.has_verified_wallet? }