'use strict';

angular.module('activity').controller('BountyClaimsController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Bounty Claims', 'Activity');

  $api.bounty_claims_activity().then(function(bounty_claims) {
    // set status of claims
    for (var i=0; i<bounty_claims.length; i++) {
      bounty_claims[i].$status = "submitted";
      if (bounty_claims[i].rejected) { bounty_claims[i].$status = "rejected"; }
      else if (bounty_claims[i].disputed) { bounty_claims[i].$status = "disputed"; }
      else if (bounty_claims[i].collected) { bounty_claims[i].$status = "accepted"; }
    }

    $scope.bounty_claims = bounty_claims;

    return bounty_claims;
  });
});
