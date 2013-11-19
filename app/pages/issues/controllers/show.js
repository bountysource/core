'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id', {
        templateUrl: 'pages/issues/show.html',
        controller: 'IssueShow'
      });
  })

  .controller('IssueShow', function ($scope, $routeParams, $window, $location, $payment, $api, $pageTitle, orderByFilter) {
    // alert above the issue title about bounty status
    $scope.bounty_alert = {
      type: 'warning',
      show: true,
      state: "available"
    };

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      // depending on the tracker, issue/comment bodies will either be html or text.
      issue.$comment_ctype = "html";
      issue.$body_ctype = "html";
      if (issue.type === "Bugzilla::Issue") {
        issue.$comment_ctype = "text";
        issue.$body_ctype = "text";
      }

    $scope.goal_data_view = false;
    $scope.developer_goal = false;

    $scope.issue = $api.issue_get($routeParams.id).then(function (issue) {
      $pageTitle.set(issue.title, issue.tracker.name);

      // set bounty info message data
      if (issue.bounty_claims.length === 0) {
        $scope.bounty_alert.state = "available";
        $scope.bounty_alert.type = "info";
      } else if (issue.winning_bounty_claim) {
        $scope.bounty_alert.state = "accepted";
        $scope.bounty_alert.type = "success";
      } else if (issue.bounty_claims.length === 1) {
        if (issue.bounty_claims[0].rejected) {
          $scope.bounty_alert.state = "rejected";
          $scope.bounty_alert.type = "error";
        } else if (issue.bounty_claims[0].disputed) {
          $scope.bounty_alert.state = "disputed";
          $scope.bounty_alert.type = "warning";
        } else {
          // good! go vote on that shit
          $scope.bounty_alert.state = "submitted";
          $scope.bounty_alert.type = "info";
        }
      } else {
        $scope.bounty_alert.state = "contested";
        $scope.bounty_alert.type = "error";
      }

      $api.get_issue_goals($routeParams.id).then(function (goals) {
        var met_goals = [];
        var unmet_goals = [];
        if (goals.length > 0) {
          for (var i = 0; i < goals.length; i++) {
            if (goals[i].amount < issue.bounty_total) {
              met_goals.push(goals[i]);
            } else {
              unmet_goals.push(goals[i]);
            }
          }
        } else {
          // NO Goals
        }
        $scope.all_goals = goals;
        $scope.met_goals = met_goals;
        $scope.next_goal = orderByFilter(unmet_goals, '+amount')[0]; //grab the nearest next goal
        $scope.total_goals = goals.length;
      });

      return issue;
    });
    $scope.$watch('current_person', function (newValue, oldValue, scope) {
      if (scope.current_person) {

        $api.solution_status($routeParams.id).then(function (solution) {
          if (!solution) {
            scope.solution = false;
          } else {
            scope.solution = solution;
            scope.status = solution.solution_events[0];
          }
        });

        $api.get_developer_goal($routeParams.id).then(function (response) {
          if (response.error) {
            scope.developer_goal = false;
          } else {
            scope.developer_goal = response;
          }
        });
      }
    });

    $scope.start_solution = function () {
      $api.start_solution($routeParams.id).then(function (response) {
        if (response) {
          $scope.solution = response;
          $scope.status = response.solution_events[0];
        }
      });
    };

    $scope.restart_solution = function () {
      $api.restart_solution($routeParams.id, $scope.solution.id).then(function (response) {
        $scope.solution = response;
        $scope.status = response.solution_events[0];
      });
    };

    $scope.stop_solution = function () {
      $api.stop_solution($routeParams.id, $scope.solution.id).then(function (response) {
        if (response) {
          $scope.solution = response;
          $scope.status = response.solution_events[0];
        }
      });
    };

    $scope.checkin_solution = function () {
      $api.checkin_solution($routeParams.id).then(function (response) {
        if (response) {
          $scope.solution = response;
          $scope.status = response.solution_events[0];
        }
      });
    };

    $scope.complete_solution = function () {
      $api.complete_solution($routeParams.id).then(function (response) {
        if (response) {
          $scope.solution = response;
          $scope.status = response.solution_events[0];
        }
      });
    };

    $scope.create_developer_goal = function (amount) {
      var data = {};
      data.amount = amount;
      data.issue_id = $routeParams.id;
      $api.create_developer_goal(data).then(function (response) {
        if (response) {
          $scope.developer_goal = response;
          $scope.developer_goal_updated = true;
        }
      });
    };

    $scope.update_developer_goal = function (amount) {
      var data = {};
      data.amount = amount;
      data.issue_id = $routeParams.id;
      $api.update_developer_goal(data).then(function (response) {
        if (response) {
          $scope.developer_goal = response;
          $scope.developer_goal_updated = true;
        }
      });
    };

    $scope.hide_developer_goal_alert = function () {
      $scope.developer_goal_updated = false;
    };

    $scope.toggle_goal_data_view = function () {
      $scope.goal_data_view = !$scope.goal_data_view;
    };

  });

