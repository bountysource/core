'use strict';

angular.module('app', ['ui.bootstrap', 'api.bountysource', 'ngSanitize', 'ngCookies'])
  .config(function ($routeProvider, $locationProvider) {   //, $provide) {

    //  NOTE: uncomment to test hashbang # mode
    //  $provide.decorator('$sniffer', function($delegate) { $delegate.history = false; return $delegate; });

    $locationProvider.html5Mode(true);
    $routeProvider.otherwise({ templateUrl: 'pages/layout/not_found.html' });

    // HACK: transform old-style #urls into new style #/urls
    if ((window.location.hash||'').match(/^#[^/]/)) {
      window.location.hash = '#/' + window.location.hash.replace(/^#/,'');
    }
  }).run(function($api) {
    // load person from initial cookies
    $api.load_current_person_from_cookies();
  });
