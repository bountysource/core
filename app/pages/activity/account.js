'use strict';

angular.module('app')
  .config(function ($routeProvider, personResolver) {
    $routeProvider
      .when('/activity/account', {
        templateUrl: 'pages/activity/account.html',
        resolve: {
          person: personResolver
        }
      });
  });

