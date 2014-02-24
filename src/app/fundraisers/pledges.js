'use strict';

angular.module('fundraisers').controller('FundraiserPledgesController', function ($scope, $routeParams, $api) {
  $api.fundraiser_pledges_get($routeParams.id).then(function(pledges) {
    // need to turn amounts into float so that it's sortable
    for (var i in pledges) { pledges[i].amount = parseFloat(pledges[i].amount); }
    $scope.pledges = pledges;
    return pledges;
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
