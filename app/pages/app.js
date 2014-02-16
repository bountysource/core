'use strict';

if (document.location.host === 'www.bountysource.com') {
  window.BS_ENV = 'prod';
} else {
  window.BS_ENV = 'staging';
}

angular.module('bountysource.services', []);
angular.module('bountysource.directives', []);
angular.module('bountysource.filters', []);
angular.module('bountysource.constants', []);
angular.module('bountysource', ['bountysource.services', 'bountysource.directives', 'bountysource.filters', 'bountysource.constants']);

angular.module('app.routes', ['ngRoute', 'bountysource.constants']);
angular.module('app.controllers', ['bountysource']);
angular.module('app', ['ngSanitize', 'ngCookies', 'colorpicker.module', 'ui.bootstrap', 'app.routes', 'app.controllers']);

angular.module('app').config(function ($locationProvider, $httpProvider, $provide) {
  //  NOTE: uncomment to test hashbang # mode
  //  $provide.decorator('$sniffer', function($delegate) { $delegate.history = false; return $delegate; });

  $locationProvider.html5Mode(true);

  // HACK: transform old-style #urls into new style #/urls
  if ((window.location.hash||'').match(/^#[^/]/)) {
    window.location.hash = '#/' + window.location.hash.replace(/^#/,'');
  }

  // CORS support
  $provide.decorator('$sniffer', function($delegate) { $delegate.cors = true; return $delegate; });
  // HACK: angular 1.0 adds this bad header... not needed in 1.1 per https://github.com/angular/angular.js/pull/1454
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

angular.module('app').run(function($api) {
  // load person from initial cookies
  $api.load_current_person_from_cookies();
});
