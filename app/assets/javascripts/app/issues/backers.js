angular.module('app').controller('IssueBackersController', function ($scope, $routeParams, $pageTitle, Issue, Bounties) {

  // load core issue object
  $scope.issue = Issue.get({
    id: $routeParams.id,
    include_tracker: true,
    include_team: true,
    include_counts: true
  }, function(issue) {
    $scope.team = issue.team;
    $pageTitle.set('Backers', $scope.issue.title, $scope.issue.tracker.name);
  });

  // load all bounties
  $scope.bounties = Bounties.get({
    issue_id: $routeParams.id,
    include_owner: true,
    order: '+amount'
  });

  // allow sorting
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
