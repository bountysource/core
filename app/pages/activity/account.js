'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/account', {
        templateUrl: 'pages/activity/account.html',
        resolve: $person
      });
  });

