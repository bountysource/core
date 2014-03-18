'use strict';

angular.module('app').controller('DeveloperGoalsBaseController', function ($scope, $api, $filter, $location, $routeParams, $analytics) {
  $scope.developer_goals = [];
  $scope.new_developer_goal = { amount: undefined };
  $scope.my_developer_goal = undefined;
  $scope.next_developer_goal = undefined;
  $scope.unmet_developer_goals = [];
  $scope.bounty_amount = 0;

  $scope.initializing_my_developer_goal = false;

  $scope.$on('developerGoalCreateReceived', function(event, new_developer_goal) {
    $scope.my_developer_goal = new_developer_goal;
    $scope.my_developer_goal.$master = angular.copy(new_developer_goal);
    $scope.developer_goals_promise.then(function(developer_goals) {
      new_developer_goal.person = $scope.current_person;
      developer_goals.push(new_developer_goal);
      $scope.next_developer_goal = $filter('orderBy')(developer_goals, ["-amount"])[0];
      return developer_goals;
    });
  });

  $scope.$on('developerGoalUpdateReceived', function(event, updated_developer_goal) {
    for (var k in updated_developer_goal) {
      $scope.my_developer_goal[k] = updated_developer_goal[k];
    }

    $scope.my_developer_goal.$master = angular.copy(updated_developer_goal);

    // reload developer goals
    $scope.initialize_developer_goals();

    $scope.my_developer_goal_updated_at = new Date();
  });

  $scope.$on('developerGoalDeleteReceived', function(event, deleted_developer_goal) {
    $scope.developer_goals_promise.then(function(developer_goals) {
      for (var i in developer_goals) {
        if (deleted_developer_goal.id === developer_goals[i].id) {
          developer_goals.splice(i,1);
        }
      }
      $scope.next_developer_goal = $filter('orderBy')(developer_goals, ["-amount"])[0];
      return developer_goals;
    });
  });

  $api.issue_get($routeParams.id).then(function(issue) {
    issue.bounty_total = parseInt(issue.bounty_total, 10);

    // set $scope.developer_events
    $scope.initialize_developer_goals();

    // Redirect to bounty create page with the min amount to fulfill the next goal
    $scope.create_minimum_bounty = function() {
      $location.path("/issues/"+issue.id+"/bounty").search({ amount: Math.max($scope.$bounty_amount, 5) });
    };

    // If the person is logged in, attempt to find their developer goal
    $scope.$watch('current_person', function(current_person) {
      if (current_person) {
        $api.get_developer_goals(issue.id).then(function(developer_goals) {
          $scope.initializing_my_developer_goal = false;

          for (var i=0; i<developer_goals.length; i++) {
            if (developer_goals[i].person.id === current_person.id) {
              $scope.my_developer_goal = developer_goals[i];
              $scope.my_developer_goal.$master = angular.copy(developer_goals[i]);
              break;
            }
          }

          return developer_goals;
        });
      } else {
        $scope.initializing_my_developer_goal = false;
      }
    });

    $scope.create_developer_goal = function() {
      $api.create_developer_goal(issue.id, $scope.new_developer_goal).then(function(new_developer_goal) {
        $scope.$emit('developerGoalCreatePushed', new_developer_goal);

        $analytics.setBountyGoal($scope.new_developer_goal.amount, issue.id);
      });
    };

    $scope.update_developer_goal = function() {
      $api.update_developer_goal(issue.id, $scope.my_developer_goal).then(function(updated_developer_goal) {
        $scope.$emit('developerGoalUpdatePushed', updated_developer_goal);

        $analytics.updateBountyGoal(updated_developer_goal.amount, issue.id);
      });
    };

    $scope.delete_developer_goal = function() {
      $api.delete_developer_goal(issue.id).then(function() {
        $scope.$emit('developerGoalDeletePushed', $scope.my_developer_goal);
        $scope.updated_developer_goal = undefined;
        $scope.my_developer_goal = undefined;
        $scope.new_developer_goal = undefined;

        $analytics.removeBountyGoal(issue.id);
      });
    };

    return issue;
  });

  $scope.initialize_developer_goals = function() {
    $api.issue_get($routeParams.id).then(function(issue) {
      $scope.developer_goals_promise = $api.get_developer_goals(issue.id).then(function(developer_goals) {
        // Collect developer goals that have not yet been met
        $scope.unmet_developer_goals = [];
        for (var i=0; i<developer_goals.length; i++) {
          if (issue.bounty_total < developer_goals[i].amount) {
            $scope.unmet_developer_goals.push(developer_goals[i]);
          }
        }

        if ($scope.unmet_developer_goals.length <= 0) {
          // All goals have been met, set as the goal with the largest amount
          $scope.next_developer_goal = $filter('orderBy')(developer_goals, ["-amount"])[0];
        } else {
          // The next developer goal is the unmet goal with the amount closest to the bounty total
          $scope.next_developer_goal = $filter('orderBy')($scope.unmet_developer_goals, ["+amount"])[0];
        }

        // if a goal was picked up, set the default bounty amount in the box to
        // the difference of goal and the current bounty_total.
        if ($scope.next_developer_goal) {
          $scope.$bounty_amount = $scope.next_developer_goal.amount - issue.bounty_total;
        }

        $scope.developer_goals = developer_goals;
        return developer_goals;
      });

      return issue;
    });
  };
});
