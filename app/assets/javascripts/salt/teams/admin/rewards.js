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
        $scope.errors = null;
      };

      $scope.save_reward = function(reward) {
        $scope.saving_edit_form = true;

        $api.support_offering_rewards.update({ id: reward.id }, {
          support_offering_reward: {
            amount: parseInt(($scope.edit_form_data.amount+"").replace(/[^0-9.]/g,'')),
            title: $scope.edit_form_data.title,
            description: $scope.edit_form_data.description
          }
        }, $state.reload, function(response) {
          $scope.errors = response.data.errors;
          $scope.saving_edit_form = false;
        });
      };

      $scope.delete_reward = function(reward) {
        $scope.deleting_form = true;

        $scope.rewards.splice($scope.rewards.indexOf(reward), 1);

        $api.support_offering_rewards.delete({ id: reward.id }, $state.reload);
      };

      $scope.create_form_data = {};
      $scope.create_reward = function() {
        $scope.saving_create_form = true;
        $api.support_offering_rewards.create({ team_slug: $scope.team.slug }, {
          support_offering_reward: {
            amount: parseInt(($scope.create_form_data.amount+"").replace(/[^0-9.]/g,'')),
            title: $scope.create_form_data.title,
            description: $scope.create_form_data.description
          }
        }, $state.reload);
      };
    }
  });
});
