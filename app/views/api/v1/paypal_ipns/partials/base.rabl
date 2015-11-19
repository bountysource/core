attribute :created_at
node(:mc_gross) { |ipn| ipn.mc_gross }
node(:mc_fee) { |ipn| ipn.mc_fee }
node(:handling_amount) { |ipn| ipn.handling_amount rescue 0.0 }
node(:payer_email) { |ipn| ipn.payer_email }
