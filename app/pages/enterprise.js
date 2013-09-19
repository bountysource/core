'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/enterprise', {
        templateUrl: 'pages/enterprise.html'
      });
  });
