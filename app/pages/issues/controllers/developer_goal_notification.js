'use strict';

angular.module('app')
  .controller('DeveloperGoalNotificationController', function ($scope, $api, $location, $filter) {
    $scope.$bounty_amount = { amount: 0 };

    $scope.issue.then(function(issue) {
      issue.bounty_total = parseInt(issue.bounty_total, 10);

      // get goals, then run through them to get the one that is closest to being completed.
      $scope.developer_goals = $api.get_developer_goals(issue.id).then(function(developer_goals) {
        issue.$unmet_developer_goals = [];
        for (var i=0; i<developer_goals.length; i++) {
          if (issue.bounty_total < developer_goals[i].amount) {
            issue.$unmet_developer_goals.push(developer_goals[i]);
          }
        }
        issue.$unmet_developer_goals = $filter('orderBy')(issue.$unmet_developer_goals, ["+amount"]);
        issue.$next_developer_goal = issue.$unmet_developer_goals[0];

        // if a goal was picked up, set the default bounty amount in the box to
        // the difference of goal and the current bounty_total.
        if (issue.$next_developer_goal) {
          $scope.$bounty_amount = issue.$next_developer_goal.amount - issue.bounty_total;
        }

        return developer_goals;
      });

      $scope.create_minimum_bounty = function() {
        $location.path("/issues/"+issue.id+"/bounty").search({ amount: $scope.$bounty_amount });
      };

      return issue;
    });
  });

