'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/bounties', {
        templateUrl: 'pages/issues/bounties.html',
        controller: 'IssueBountiesController'
      });
  })

  .controller('IssueBountiesController', function ($scope, $routeParams, $api) {
    console.log($scope, $routeParams, $api);
  });

