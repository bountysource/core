'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/unacknowledged_bounties', {
        templateUrl: 'admin/bounties/unacknowledged.html',
        controller: "UnacknowledgedBountiesController"
      });
  })
  .controller("UnacknowledgedBountiesController", function ($scope, $window, $api) {
    $scope.working = true;

    $scope.bounties = $api.get_unacknowledged_bounties().then(function(bounties) {
      $scope.working = false;

      for (var i=0; i<bounties.length; i++) {
        bounties[i].$acknowledged = !!bounties[i].acknowledged_at;
      }

      return bounties;
    });

    $scope.toggle_acknowledged = function(bounty) {
      if (bounty.$acknowledged) {
        $api.acknowledge_bounty(bounty.id);
      } else {
        $api.unacknowledge_bounty(bounty.id);
      }
    };
  });
