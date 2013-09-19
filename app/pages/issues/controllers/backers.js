'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/backers', {
        templateUrl: 'pages/issues/backers.html',
        controller: 'IssueBountiesController'
      });
  })

  .controller('IssueBountiesController', function ($scope, $routeParams, $api) {
    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      for (var i=0; i<issue.bounties.length; i++) {
        issue.bounties[i].amount = Number(issue.bounties[i].amount);
      }

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
