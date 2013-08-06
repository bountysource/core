'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/terms', {
        templateUrl: 'pages/about/terms.html',
        controller: 'Static',
        title: 'Bountysource - Terms of Service'
      });
  });
