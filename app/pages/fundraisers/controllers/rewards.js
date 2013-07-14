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
    $scope.fundraiser = $api.fundraiser_info_get($routeParams.id).then(function(response) {
      $scope.rewards = response.rewards;

      // initially open all of the tabs
      angular.forEach($scope.rewards, function(r) { r.$is_open = true; });

      return response;
    });

    $scope.expand_all = true;
    $scope.toggle_expand_all = function() {
      $scope.expand_all = !$scope.expand_all;
      for (var i=0; i<$scope.rewards.length; i++) { $scope.rewards[i].$is_open = $scope.expand_all; }
    };
  });
