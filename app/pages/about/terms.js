'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/terms', {
        templateUrl: 'pages/about/terms.html',
        controller: 'Static',
        title: 'Terms of Service',
        trackEvent: 'View Terms'
      });
  });
