'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledges/new', {
        templateUrl: 'pages/pledges/new.html',
        controller: 'FundraiserPledgeCreateController'
      });
  })

  .controller('FundraiserPledgeCreateController', function ($scope, $routeParams, $api) {
    $scope.pledge = {};
    $scope.payment_method = null;

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      return response;
    });

    $scope.show_popover = true;

    $scope.select_reward = function(reward_data) {
      $scope.pledge.reward = reward_data;

      if (!$scope.pledge.amount || $scope.pledge.amount < reward_data.amount) {
        $scope.pledge.amount = reward_data.amount;
      }
    };

    $scope.create_payment = function() {
      console.log('TODO create payment');
    }
  });
