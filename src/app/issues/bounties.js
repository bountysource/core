'use strict';

angular.module('app').controller('IssueBountiesController', function ($scope, $routeParams, $api, Issue, Bounties, $pageTitle) {
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

  $scope.sort_column = 'amount';
  $scope.sort_reverse = true;
  $scope.sort_by = function(col) {
    // if clicking this column again, then reverse the direction.
    if ($scope.sort_column === col) {
      $scope.sort_reverse = !$scope.sort_reverse;
    } else {
      $scope.sort_column = col;
    }
  };
});
