'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id', {
        templateUrl: 'pages/issues/show.html',
        controller: 'IssueShow'
      });
  })

  .controller('IssueShow', function ($scope, $routeParams, $window, $location, $payment, $api, $pageTitle) {
    // alert above the issue title about bounty status
    $scope.bounty_alert = {
      type: 'warning',
      show: true,
      state: "available"
    };

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
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

      return issue;
    });
  });

