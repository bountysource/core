'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/bounties', {
        templateUrl: 'pages/issues/bounties.html',
        controller: 'IssueBountiesController'
      });
  })

  .controller('IssueBountiesController', function ($scope, $routeParams, $api) {
    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      var bounties = [];
      for (var i=0; i<issue.bounties.length; i++) {
        if (issue.bounties[i].status !== 'refunded') {
          issue.bounties[i].amount = Number(issue.bounties[i].amount);
          bounties.push(angular.copy(issue.bounties[i]));
        }
      }
      issue.bounties = bounties;

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

