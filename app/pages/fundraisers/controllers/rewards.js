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
      console.log(response);

      return response;
    });
  });
