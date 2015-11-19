"use strict";

angular.module('app').controller('TeamRewardsController', function ($scope, $routeParams, $location, $api) {

  $scope.$watch('activeFundraiser', function (fundraiser) {
    if(fundraiser) {
      $api.fundraiser_reward_info_get(fundraiser.id).then(function(response) {
        var rewards = response.rewards;
        // initially open all of the tabs
        for (var i=0; i<rewards.length; i++) {
          rewards[i].$is_open = true;
        }
        $scope.rewards = rewards;
        return rewards;
      });
    }
  });

  $scope.expand_all = true;
  $scope.toggle_expand_all = function() {
    $scope.expand_all = !$scope.expand_all;
    for (var i=0; i<$scope.rewards.length; i++) {
      $scope.rewards[i].$is_open = $scope.expand_all;
    }
  };
});
