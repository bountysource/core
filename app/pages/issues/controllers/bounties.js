'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/bounties', {
        templateUrl: 'pages/issues/bounties.html',
        controller: 'IssueBountiesController'
      });
  })

  .controller('IssueBountiesController', function ($scope) {
    $scope.sort_column = function(bounty) {
      return Number(bounty.amount);
    };

    $scope.sort_reverse = true;

    $scope.sort_by = function(col) {
      // if clicking this column again, then reverse the direction.
      if ($scope.sort_column === col) {
        $scope.sort_reverse = !$scope.sort_reverse;
      } else {
        $scope.sort_column = col;
      }
    };

    //hacky quick fix for sorting by strings of numbers
    $scope.sort_by_amount = function() {
      if (typeof($scope.sort_column) === 'function') {
        $scope.sort_reverse = !$scope.sort_reverse;
      } else {
        $scope.sort_column = function(bounty) {
          return Number(bounty.amount);
        };
      }
    };
  });

