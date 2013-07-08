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

    $scope.toggle_anonymous = function(bounty) {
      $api.bounty_anonymity_toggle(bounty).then(function(response) {
        bounty.anonymous = !bounty.anonymous;
      });
    };
  });

