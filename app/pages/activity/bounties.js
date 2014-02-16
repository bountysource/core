'use strict';

angular.module('app.controllers').controller('BountyActivity', ['$scope', '$routeParams', '$api', '$pageTitle', function($scope, $routeParams, $api, $pageTitle) {
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
}]);
