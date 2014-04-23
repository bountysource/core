'use strict';

angular.module('app').controller('IssueShow', function ($scope, $routeParams, $window, $location, $pageTitle, $anchorScroll, Comments, Issue, Bounties) {

  // alert above the issue title about bounty status
  $scope.bounty_alert = {
    type: 'warning',
    show: true,
    state: "available"
  };

  // Load issue object
  $scope.issue = Issue.get({
    id: $routeParams.id,
    include_body_html: true,
    include_author: true,
    include_tracker: true
  }, function (issue) {
    $pageTitle.set(issue.title, issue.tracker.name);
  });

  // Load issue bounties
  $scope.bounties = Bounties.get({
    issue_id: $routeParams.id,
    include_owner: true,
    order: '+amount'
  }, function (bounties) {
    $scope.issue.$promise.then(function (issue) {
      issue.bounties = bounties;
    });
  });

  // Load issue comments
  $scope.comments = Comments.index({
    issue_id: $routeParams.id,
    include_author: true
  });

  // Scroll to linked comment after render finishes
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
      $anchorScroll();
    });

});
