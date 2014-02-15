'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/rewards', {
        templateUrl: 'pages/fundraisers/rewards.html',
        controller: 'FundraiserController'
      });
  })

  .controller('FundraiserRewardInfoController', function ($scope, $routeParams, $location, $api) {
    $api.fundraiser_reward_info_get($routeParams.id).then(function(rewards) {
      // initially open all of the tabs
      for (var i=0; i<rewards.length; i++) {
        rewards[i].$is_open = true;
      }
      $scope.rewards = rewards;
      return rewards;
    });

    $scope.expand_all = true;
    $scope.toggle_expand_all = function() {
      $scope.expand_all = !$scope.expand_all;
      for (var i=0; i<$scope.rewards.length; i++) {
        $scope.rewards[i].$is_open = $scope.expand_all;
      }
    };
  });
