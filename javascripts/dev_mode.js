with (scope()) {
  initializer(function() {
    // NOTE: this is read before Storage.namespace is set, so it won't get prefixed
    //var environment = (navigator.userAgent == 'Selenium') ? 'test' : (Storage.get('environment') || 'prod');
    var environment = Storage.get('environment') || 'prod';

    switch (environment) { 
      case 'dev':
        Storage.namespace = 'dev';
        Bountysource.api_host = 'http://api.bountysource.dev/';
        Bountysource.access_token_key = 'bountysource_access_token_dev';
      break;
      case 'qa':
        Storage.namespace = 'qa';
        Bountysource.api_host = 'https://api-qa.bountysource.com/';
        Bountysource.access_token_key = 'bountysource_access_token_qa';
      break;
      case 'test':
        Storage.namespace = 'test';
        Bountysource.api_host = 'http://test.example/';
        Bountysource.access_token_key = 'bountysource_access_token_test';
      break;
      case 'prod':
        Storage.namespace = 'prod';
        Bountysource.api_host = 'https://api.bountysource.com/';
        Bountysource.access_token_key = 'bountysource_access_token_prod';
      break;
    }
  });

  define('set_environment', function(env) {
    Storage.namespace = null;
    Storage.set('environment', env);
    document.location.reload();
  });

  after_filter('add_dev_mode_bar', function() {
    if (!document.getElementById('dev-bar')) {
      document.body.appendChild(
        div({ id: 'dev-bar', style: "position: fixed; bottom: 0; right: 0; background: white; color: black; padding: 5px; z-index: 200" }, 
          (Bountysource.api_host == 'http://test.example/' ? [b('test'), ' | '] : []),
          (Bountysource.api_host == 'http://api.bountysource.dev/' ? b('dev') : a({ href: curry(set_environment, 'dev') }, 'dev')),
          ' | ',
          ((Bountysource.api_host == 'https://api-qa.bountysource.com/' && !Bountysource.demo_mode) ? b('qa') : a({ href: curry(set_environment, 'qa') }, 'qa')),
          ' | ',
          (Bountysource.api_host == 'https://api.bountysource.com/' ? b('prod') : a({ href: curry(set_environment, 'prod') }, 'prod'))
        )
      );
    }
  });
}
