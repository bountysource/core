'use strict';

angular.module('app').controller('IssueShow', function ($scope, $routeParams, $window, $location, $pageTitle, Comments, Issue) {

  // alert above the issue title about bounty status
  $scope.bounty_alert = {
    type: 'warning',
    show: true,
    state: "available"
  };

  $scope.issue = Issue.get({
    id: $routeParams.id,
    include_body_html: true,
    include_author: true,
    include_tracker: true
  }, function (issue) {
    $pageTitle.set(issue.title, issue.tracker.name);
  });

  // Load issue comments
  $scope.comments = Comments.index({
    issue_id: $routeParams.id,
    include_author: true
  });

});
