'use strict';

angular.module('app')
  .config(function ($routeProvider, personResolver) {
    $routeProvider
      .when('/fundraisers/:id/edit', {
        templateUrl: 'pages/fundraisers/edit.html',
        controller: 'FundraiserController',
        resolve: {
          person: personResolver
        }
      });
  })

  .controller('FundraiserEditController', function($scope, $routeParams, $location, $api) {
    // initialize fundraiser data and changes
    $scope.master = {};
    $scope.changes = {};
    $scope.rewards = [];
    $scope.master_rewards = [];

    $scope.unsaved_changes = function() {
      return !angular.equals($scope.master, $scope.changes);
    };

    $api.person_teams($scope.current_person.id).then(function(teams) {
      $scope.teams = teams;
      return teams;
    });

    $scope.fundraiser_get_promise.then(function(fundraiser) {
      // cache the fundraiser. angular.copy does a deep copy, FYI
      // if you don't create a copy, these are both bound to the input

      var fundraiser = angular.copy(fundraiser);
      if (fundraiser.team) {
        fundraiser.team_id = fundraiser.team.id;
      }
      delete fundraiser.team;

      $scope.master = angular.copy(fundraiser);
      $scope.changes = angular.copy(fundraiser);

      delete $scope.changes.image_url;

      // also cache rewards
      $scope.master_rewards = angular.copy(fundraiser.rewards);
      return fundraiser;
    });

    $scope.cancel = function() { $location.url("/fundraisers/"+$scope.master.slug); };

    $scope.save = function() {
      $api.fundraiser_update($routeParams.id, $scope.changes).then(function(response) {
        if (response.error) {
          $scope.error = response.error;

          // TODO replace master reward with the current one
        } else {
          $location.path("/fundraisers/"+$scope.master.slug);
        }
      });
    };

    $scope.new_reward = {};

    $scope.create_reward = function(fundraiser) {
      $api.reward_create($routeParams.id, $scope.new_reward, function(response) {

        if (response.meta.success) {
          // reset the new_reward model
          $scope.new_reward = {};

          // push this new reward onto the table
          fundraiser.rewards.push(response.data);
        } else {
          $scope.reward_error = response.data.error;
        }
      });
    };

    $scope.update_reward = function(reward) {
      $api.reward_update($routeParams.id, reward.id, reward, function(response) {
        if (response.meta.success) {
          for (var i=0; i<$scope.rewards.length; i++) {
            if ($scope.rewards[i].id === reward.id) {
              // copy attributes from current reward to master
              for (var k in $scope.rewards[i]) {
                $scope.master_rewards[i][k] = $scope.rewards[i][k];
              }
              $scope.rewards[i].$is_open = false;
              return;
            }
          }
        } else {
          $scope.reward_error = response.data.error;
        }
      });
    };

    $scope.cancel_reward_changes = function(reward) {
      for (var i=0; i<$scope.master_rewards.length; i++) {
        if ($scope.master_rewards[i].id === reward.id) {
          // copy attributes from master reward to this one
          for (var k in $scope.master_rewards[i]) {
            $scope.rewards[i][k] = $scope.master_rewards[i][k];
          }
          $scope.rewards[i].$is_open = false;
          return;
        }
      }
    };

    $scope.destroy_reward = function(reward) {
      $api.reward_destroy($routeParams.id, reward.id, function(response) {
        if (response.meta.success) {
          // traverse the cached rewards, and remove this one
          for (var i=0; i<fundraiser.rewards.length; i++) {
            if (fundraiser.rewards[i].id === reward.id) {
              fundraiser.rewards.splice(i,1);
              break;
            }
          }
        }
      });
    };

  });
