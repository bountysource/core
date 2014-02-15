'use strict';

angular.module('app')
  .config(function ($routeProvider, personResolver) {
    $routeProvider
      .when('/activity/bounties', {
        templateUrl: 'pages/activity/bounties.html',
        controller: 'BountyActivity',
        resolve: {
          person: personResolver
        }
      });
  })

  .controller('BountyActivity', function($scope, $routeParams, $api, $pageTitle) {
    $pageTitle.set('Bounties', 'Activity');

    $api.call("/user/bounties").then(function(bounties) {
      $scope.bounties = bounties;
      return bounties;
    });

    $scope.toggle_anonymous = function(bounty) {
      $api.bounty_anonymity_toggle(bounty).then(function() {
        bounty.anonymous = !bounty.anonymous;
      });
    };
  });

