'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/enterprise', {
        templateUrl: 'pages/enterprise.html'
      });
  });
