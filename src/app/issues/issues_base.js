'use strict';

angular.module('app').controller('IssuesBaseController', function ($scope, $routeParams, $analytics) {
  // Listen for developer goal create/updates. Broadcast update to all Controller instances.
  $scope.$on('developerGoalCreatePushed', function(event, new_developer_goal) {
    $scope.$broadcast('developerGoalCreateReceived', new_developer_goal);
  });

  $scope.$on('developerGoalUpdatePushed', function(event, updated_developer_goal) {
    $scope.$broadcast('developerGoalUpdateReceived', updated_developer_goal);
  });

  $scope.$on('developerGoalDeletePushed', function(event, deleted_developer_goal) {
    $scope.$broadcast('developerGoalDeleteReceived', deleted_developer_goal);
  });

  // Listen for solution create/updates. Broadcast update to all Controller instances.
  $scope.$on('solutionCreatePushed', function(event, new_solution) {
    $scope.$broadcast('solutionCreateReceived', new_solution);
  });

  $scope.$on('solutionUpdatePushed', function(event, updated_solution) {
    $scope.$broadcast('solutionUpdateReceived', updated_solution);
  });

  $scope.bountyTabClicked = function() {
    $analytics.bountyStart({ type: 'tab' });
  };

  $scope.bountyClaimTabClicked = function() {
    $analytics.startBountyClaim($routeParams.id, { type: 'tab' });
  };
});
