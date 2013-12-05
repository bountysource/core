'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/rewards', {
        templateUrl: 'pages/fundraisers/rewards.html',
        controller: 'FundraiserRewardsInfoController'
      });
  })

  .controller('FundraiserRewardsInfoController', function ($scope, $routeParams, $location, $api) {
    $api.fundraiser_info_get($routeParams.id).then(function(fundraiser) {
      $scope.rewards = fundraiser.rewards;
      $scope.fundraiser = fundraiser;

      // initially open all of the tabs
      angular.forEach($scope.rewards, function(r) { r.$is_open = true; });

      return fundraiser;
    });

    $scope.expand_all = true;
    $scope.toggle_expand_all = function() {
      $scope.expand_all = !$scope.expand_all;
      for (var i=0; i<$scope.rewards.length; i++) { $scope.rewards[i].$is_open = $scope.expand_all; }
    };
  });
