Rails.application.config.assets.precompile += %w( app.js bountysource.css vendors.js zenmix.js admin.js admin.css admin_vendors.js salt.js salt.css )
Rails.application.config.assets.paths << Rails.root.join('vendor', 'assets', 'components')
Rails.application.config.angular_templates.ignore_prefix  = 'bs_templates/'
