'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about/history', {
        templateUrl: 'pages/about/history.html',
        controller: 'Static'
      });
  });
