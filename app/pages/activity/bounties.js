'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/bounties', {
        templateUrl: 'pages/activity/bounties.html',
        controller: 'BountyActivity',
        resolve: $person,
        title: ['Bounties', 'Activity']
      });
  })
  .controller('BountyActivity', function($scope, $routeParams, $api) {
    $scope.bounties = $api.call("/user/bounties");

    $scope.toggle_anonymous = function(bounty) {
      $api.bounty_anonymity_toggle(bounty).then(function() {
        bounty.anonymous = !bounty.anonymous;
      });
    };
  });

