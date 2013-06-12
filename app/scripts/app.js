'use strict';

angular.module('app', ['ui.bootstrap', 'api.bountysource', 'ngSanitize'])
  .config(function ($routeProvider, $locationProvider, $provide) {

    //  NOTE: uncomment to test hashbang # mode
    //  $provide.decorator('$sniffer', function($delegate) { $delegate.history = false; return $delegate; });

    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/person', {
        templateUrl: 'views/person.html',
        controller: 'PersonCtrl'
      })
      .when('/fundraiser', {
        templateUrl: 'views/fundraiser.html',
        controller: 'FundraiserCtrl'
      })
      .when('/issue', {
        templateUrl: 'views/issue.html',
        controller: 'IssueCtrl'
      })
      .when('/tracker', {
        templateUrl: 'views/tracker.html',
        controller: 'TrackerCtrl'
      })
      .otherwise({
        templateUrl: 'views/layout/not_found.html'
      });
  });
