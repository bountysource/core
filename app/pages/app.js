'use strict';

window.BS_ENV = (document.location.host === 'www.bountysource.com' ? 'prod' : 'qa');

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
  }).run(function($api, $rootScope) {
    // load person from initial cookies
    $api.load_current_person_from_cookies();

    // this really doesn't belong here
    $rootScope.chatroom = {
      show: false,
      toggle: function() { $rootScope.chatroom.show = !$rootScope.chatroom.show; },
      nick: "Guest" + Math.ceil(Math.random() * 100000),
      url: "none",
      connect: function() { console.log($rootScope.chatroom.nick); $rootScope.chatroom.url = '/chat/?nick=' + $rootScope.chatroom.nick; }
    };
  });
