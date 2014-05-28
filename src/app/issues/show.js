'use strict';

angular.module('app').controller('IssueShow', function ($scope, $routeParams, $window, $location, $pageTitle, $anchorScroll, Comments) {
  // alert above the issue title about bounty status
  $scope.bounty_alert = {
    type: 'warning',
    show: true,
    state: "available"
  };

  // Load issue comments
  $scope.comments = Comments.index({
    issue_id: $routeParams.id,
    include_author: true
  });
});
