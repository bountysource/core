'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin.rewards', {
    url: "/teams/{slug}/admin/rewards",
    templateUrl: "salt/teams/admin/rewards.html",
    container: false,
    controller: function($scope, $state, $timeout, $api) {
      $scope.rewards = angular.copy($scope.team.support_offering.rewards || []);

      $scope.rewards.currently_editing = null;
      $scope.start_editing = function(reward, form) {
        // editing wipes out create_form_data
        $scope.create_form_data = {};

        form.$setPristine();

        if ($scope.rewards.currently_editing) {
          $scope.cancel_editing($scope.rewards.currently_editing);
        }
        $scope.rewards.currently_editing = reward;

        $scope.edit_form_data = {
          amount: reward.amount,
          title: reward.title,
          description: reward.description
        };
      };
      $scope.cancel_editing = function(reward) {
        $scope.rewards.currently_editing = null;
      };

      $scope.save_reward = function(reward) {
        $scope.saving_edit_form = true;

        $api.teams.update({ slug: $scope.team.slug }, {
          update_support_offering_reward: {
            id: reward.id,
            amount: parseInt(($scope.edit_form_data.amount+"").replace(/[^0-9.]/g,'')),
            title: $scope.edit_form_data.title,
            description: $scope.edit_form_data.description
          }
        }, $state.reload);
      };

      $scope.delete_reward = function(reward) {
        $scope.deleting_form = true;

        $scope.rewards.splice($scope.rewards.indexOf(reward), 1);

        $api.teams.update({ slug: $scope.team.slug }, {
          destroy_support_offering_reward: reward
        }, $state.reload);
      };

      $scope.create_form_data = {};
      $scope.create_reward = function() {
        $scope.saving_create_form = true;
        $api.teams.update({ slug: $scope.team.slug }, {
          create_support_offering_reward: {
            amount: parseInt(($scope.create_form_data.amount+"").replace(/[^0-9.]/g,'')),
            title: $scope.create_form_data.title,
            description: $scope.create_form_data.description
          }
        }, $state.reload);
      };
    }
  });
});
