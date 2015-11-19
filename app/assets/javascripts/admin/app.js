angular.module('app', ['ui.bootstrap', 'api.bountysource', 'ngSanitize', 'ngCookieJar', 'templates'])
  .config(function ($routeProvider, $locationProvider, $httpProvider, $provide) {

    //  NOTE: uncomment to test hashbang # mode
    //  $provide.decorator('$sniffer', function($delegate) { $delegate.history = false; return $delegate; });

    $locationProvider.html5Mode(true);
    $routeProvider.otherwise({ templateUrl: 'admin/layout/not_found.html' });

    // HACK: transform old-style #urls into new style #/urls
    if ((window.location.hash||'').match(/^#[^/]/)) {
      window.location.hash = '#/' + window.location.hash.replace(/^#/,'');
    }

    // CORS support
    $provide.decorator('$sniffer', function($delegate) { $delegate.cors = true; return $delegate; });
    // HACK: angular 1.0 adds this bad header... not needed in 1.1 per https://github.com/angular/angular.js/pull/1454
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

  }).run(function($api, $rootScope, $location) {
    // load person from initial cookies
    $api.load_current_person_from_cookies();

    $rootScope.isCurrentUrl = function(route) {
      return route === $location.path();
    };
  });
