'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/privacy-policy', {
        templateUrl: 'pages/about/privacy_policy.html',
        controller: 'Static'
      });
  });
