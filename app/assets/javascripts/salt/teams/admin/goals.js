'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin.goals', {
    url: "/teams/{slug}/admin/goals",
    templateUrl: "salt/teams/admin/goals.html",
    container: false,
    controller: function($scope, $state, $timeout, $api) {
      $scope.goals = angular.copy($scope.team.support_offering.goals || []);

      $scope.goals.currently_editing = null;
      $scope.start_editing = function(goal, form) {
        // editing wipes out create_form_data
        $scope.create_form_data = {};

        form.$setPristine();

        if ($scope.goals.currently_editing) {
          $scope.cancel_editing($scope.goals.currently_editing);
        }
        $scope.goals.currently_editing = goal;

        $scope.edit_form_data = {
          amount: goal.amount,
          title: goal.title,
          description: goal.description
        };
      };
      $scope.cancel_editing = function(goal) {
        $scope.goals.currently_editing = null;
      };

      $scope.save_goal = function(goal) {
        $scope.saving_edit_form = true;

        // assumes this goal object is the same that's in $scope.goals
        goal.amount = parseInt(($scope.edit_form_data.amount+"").replace(/[^0-9.]/g,''));
        goal.title = $scope.edit_form_data.title;
        goal.description = $scope.edit_form_data.description;

        $api.teams.update({ slug: $scope.team.slug }, {
          support_offering: {
            goals: $scope.goals
          }
        }, $state.reload);
      };

      $scope.delete_goal = function(goal) {
        $scope.deleting_form = true;

        $scope.goals.splice($scope.goals.indexOf(goal), 1);

        $api.teams.update({ slug: $scope.team.slug }, {
          support_offering: {
            goals: $scope.goals
          }
        }, $state.reload);
      };

      $scope.create_form_data = {};
      $scope.create_goal = function() {
        $scope.saving_create_form = true;
        $api.teams.update({ slug: $scope.team.slug }, {
          support_offering: {
            goals: $scope.goals.concat({
              amount: parseInt(($scope.create_form_data.amount+"").replace(/[^0-9.]/g,'')),
              title: $scope.create_form_data.title,
              description: $scope.create_form_data.description
            })
          }
        }, $state.reload);
      };
    }
  });
});
