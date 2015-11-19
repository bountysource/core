'use strict';

angular.module('activity').controller('BountiesController', function($scope, $routeParams, $api, $pageTitle) {
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
