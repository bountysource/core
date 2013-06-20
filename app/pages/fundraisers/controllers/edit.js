'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/edit', {
        templateUrl: 'pages/fundraisers/edit.html',
        controller: 'FundraiserEditController'
      });
  })

  .controller('FundraiserEditController', function($scope, $routeParams, $location, $api) {
    // initialize fundraiser data and changes
    $scope.master = {};
    $scope.changes = {};

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      // cache the fundraiser. angular.copy does a deep copy, FYI
      // if you don't create a copy, these are both bound to the input
      $scope.master = angular.copy(response);
      $scope.changes = angular.copy(response);
      return response;
    });

    $scope.cancel = function() { $location.url("/fundraisers/"+$scope.master.slug); };

    $scope.save = function() {
      $api.fundraiser_update($routeParams.id, $scope.changes).then(function(response) {
        // TODO proper error callback through the $q promise api `promise.reject(response)`
        if (response.error) {
          $scope.alerts.push({ type: 'error', msg: response.error });
        } else {
          $location.path("/fundraisers/"+$scope.master.slug);
        }
      });
    };
  })

  .controller('RewardsController', function($scope, $api) {
    $scope.new_reward = {};

    $scope.create_reward = function(fundraiser) {
      $api.reward_create(fundraiser.id, $scope.new_reward, function(response) {

        console.log(response);

        if (response.meta.success) {
          // reset the new_reward model
          $scope.new_reward = {};

          // push this new reward onto the table
          fundraiser.rewards.push(response.data);
        } else {
          $scope.error = response.data.error;
        }
      });
    };

    $scope.update_reward = function(fundraiser, reward) {
      console.log('TODO update reward with reward.id');

      $api.reward_update(fundraiser.id, reward.id, reward, function(response) {

      });
    };

    $scope.destroy_reward = function(fundraiser, reward) {
      console.log('TODO destroy reward with reward.id');
    };
  });
