'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/backers', {
        templateUrl: 'pages/issues/backers.html',
        controller: 'IssueBountiesController'
      });
  })

  .controller('IssueBountiesController', function ($scope) {
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
