'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/privacy', {
        templateUrl: 'pages/about/privacy_policy.html',
        controller: 'Static',
        title: 'Bountysource - Privacy Policy'
      });
  });
