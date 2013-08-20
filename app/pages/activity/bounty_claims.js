'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/claims', {
        templateUrl: 'pages/activity/bounty_claims.html',
        controller: 'BountyClaimActivity',
        resolve: $person,
        title: ['Bounty Claims', 'Activity']
      });
  })
  .controller('BountyClaimActivity', function($scope, $routeParams, $api) {
    $scope.bounty_claims = $api.bounty_claims_activity().then(function(bounty_claims) {
      // set status of claims
      for (var i=0; i<bounty_claims.length; i++) {
        bounty_claims[i].$status = "submitted";
        if (bounty_claims[i].rejected) { bounty_claims[i].$status = "rejected"; }
        else if (bounty_claims[i].disputed) { bounty_claims[i].$status = "disputed"; }
        else if (bounty_claims[i].collected) { bounty_claims[i].$status = "accepted"; }
      }

      return bounty_claims;
    });
  });

