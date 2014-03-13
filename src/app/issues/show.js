'use strict';

angular.module('app').controller('IssueShow', function ($scope, $routeParams, $window, $location, $api, $pageTitle) {
  // alert above the issue title about bounty status
  $scope.bounty_alert = {
    type: 'warning',
    show: true,
    state: "available"
  };

  $api.issue_get($routeParams.id).then(function(issue) {
    $pageTitle.set(issue.title, issue.tracker.name);

    // depending on the tracker, issue/comment bodies will either be html or text.
    issue.$comment_ctype = "html";
    issue.$body_ctype = "html";
    if (issue.type === "Bugzilla::Issue") {
      issue.$comment_ctype = "text";
      issue.$body_ctype = "text";
    }

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

    $scope.issue = issue;
    return issue;
  });

  // $api.v2.comments({
  //   issue_id: $routeParams.id,
  //   include_author: true,
  //   include_body_html: true
  // }).then(function (response) {
  //   console.log("V2 response", response.data);
  //   $scope.comments = response.data;
  // });
});
