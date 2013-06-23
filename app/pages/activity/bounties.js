'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/bounties', {
        templateUrl: 'pages/activity/bounties.html',
        controller: 'BountyActivity',
        resolve: $person
      });
  })
  .controller('BountyActivity', function($scope, $routeParams, $api) {
    $scope.bounties = $api.bounty_activity();
  });

