'use strict';

angular.module('app').controller('IssueBountiesController', function ($scope, $routeParams, $api) {
  $api.issue_get($routeParams.id).then(function(issue) {
    $scope.issue = issue;
    return issue;
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
