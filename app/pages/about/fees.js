'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fees', {
        templateUrl: 'pages/about/fees.html',
        controller: 'Static',
        title: 'Bountysource - Pricing'
      });
  });
