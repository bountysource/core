'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/backers', {
        templateUrl: 'pages/fundraisers/pledges.html',
        controller: 'FundraiserController'
      });
  })

  .controller('FundraiserPledgesController', function ($scope, $routeParams, $api) {
//    $api.call("/user/fundraisers/"+$routeParams.id+"/top_backers", { per_page: 100 }, function(response) {
//      if (response.meta.success) {
//        var pledges = response.data;
//
//        for (var i in pledges) {
//          pledges[i].amount = parseFloat(pledges[i].amount);
//        }
//
//        $scope.pledges = pledges;
//        return pledges;
//      }
//    });

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
