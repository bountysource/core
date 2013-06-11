'use strict';

angular.module('app', [])
  .config(function ($routeProvider, $locationProvider, $provide) {

//  NOTE: uncomment to test # mode
//  $provide.decorator('$sniffer', function($delegate) {
//    $delegate.history = false;
//    return $delegate;
//  });

    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/person', {
        templateUrl: 'views/person.html',
        controller: 'PersonCtrl'
      })
      .when('/bounty', {
        templateUrl: 'views/bounty.html',
        controller: 'BountyCtrl'
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
