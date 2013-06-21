'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/activity/bounties', {
        templateUrl: 'pages/activity/bounties.html',
        controller: 'BountyActivity'
      });
  })
  .controller('BountyActivity', function($scope, $routeParams, $api) {
    $scope.$watch("current_person", function() {
      if ($scope.current_person) {
        $scope.bounties = $api.bounty_activity();
      }
    });
  });

