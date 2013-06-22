'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledges', {
        templateUrl: 'pages/pledges/index.html',
        controller: 'FundraiserPledgeController'
      });
  })

  .controller('FundraiserPledgeController', function ($scope, $routeParams, $api) {
    $scope.pledges = $api.fundraiser_pledges_get($routeParams.id);

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
