'use strict';

angular.module('fundraisers').controller('FundraiserEditController', function($scope, $routeParams, $location, $api, $analytics) {
  // initialize fundraisers data and changes
  $scope.master = {};
  $scope.changes = {};
  $scope.rewards = [];
  $scope.master_rewards = [];

  // Enable/disable rewards edit view
  if ($routeParams.rewards_edit) {
    $scope.rewards_edit = true;
  }

  $scope.fundraiserPromise = $api.fundraiser_get($routeParams.fundraiser_id).then(function(fundraiser) {

    $scope.fundraiser = angular.copy(fundraiser);

    // Not sure if these are used anywhere else besides fundraiserManageButtons, leave for now.
    $scope.can_manage = $scope.fundraiser.person && $scope.current_person && $scope.fundraiser.person.id === $scope.current_person.id;
    $scope.publishable = $scope.fundraiser.title && fundraiser.short_description && $scope.fundraiser.funding_goal && fundraiser.description;

    return $scope.fundraiser;
  });

  $scope.unsaved_changes = function() {
    // temporarily add master.image_url back to changes for comparison purposes
    var test_master = angular.copy($scope.master);
    var test_changes = angular.copy($scope.changes);

    // no new image_url added, its safe to use the version from master
    if (!test_changes.image_url) {
      test_changes.image_url = test_master.image_url;
    }

    return !angular.equals(test_master, test_changes);
  };

  $scope.$watch("current_person", function (current_person) {
    if(current_person) {
      $api.person_teams(current_person.id).then(function(teams) {
        $scope.teams = teams;
        return teams;
      });
    }
  });

  $scope.fundraiserPromise.then(function(fundraiser) {
    // cache the fundraisers. angular.copy does a deep copy, FYI
    // if you don't create a copy, these are both bound to the input
    fundraiser = angular.copy(fundraiser);

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

  $scope.cancel = function() { $location.url("/teams/"+$routeParams.id+"/fundraisers/"+$scope.master.slug); };

  $scope.save = function() {
    $api.fundraiser_update($routeParams.fundraiser_id, $scope.changes).then(function(response) {
      if (response.error) {
        $scope.error = response.error;

        // TODO replace master reward with the current one
      } else {
        $location.path("/teams/"+response.team.slug+"/fundraisers/"+$scope.master.slug);
      }
    });
  };

  $scope.new_reward = {};

  $scope.create_reward = function(fundraiser) {
    $api.reward_create($routeParams.fundraiser_id, $scope.new_reward, function(response) {

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

  $scope.update_reward = function(reward, fundraiser) {
    $api.reward_update($routeParams.fundraiser_id, reward.id, reward, function(response) {
      if (response.meta.success) {
        for (var i=0; i<fundraiser.rewards.length; i++) {
          if (fundraiser.rewards[i].id === response.data.id) {
            fundraiser.rewards[i] = angular.copy(response.data);
            fundraiser.rewards[i].$is_open = false;
          }
        }
      } else {
        $scope.reward_error = response.data.error;
      }
    });
  };

  $scope.cancel_reward_changes = function(reward, fundraiser) {
    for (var i=0; i<$scope.master_rewards.length; i++) {
      if ($scope.master_rewards[i].id === reward.id) {
        // copy attributes from master reward to this one
        for (var k in $scope.master_rewards[i]) {
          fundraiser.rewards[i][k] = $scope.master_rewards[i][k];
        }
        fundraiser.rewards[i].$is_open = false;
        return;
      }
    }
  };

  $scope.destroy_reward = function(reward) {
    $api.reward_destroy($routeParams.fundraiser_id, reward.id, function(response) {
      if (response.meta.success) {

        // traverse the cached rewards, and remove this one
        $scope.fundraiserPromise.then(function(fundraiser) {
          for (var i=0; i<fundraiser.rewards.length; i++) {
            if (fundraiser.rewards[i].id === reward.id) {
              fundraiser.rewards.splice(i,1);
              break;
            }
          }
          return fundraiser;
        });
      }
    });
  };

});
