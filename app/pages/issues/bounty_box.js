'use strict';

angular.module('app.controllers').controller('BountyBoxController', function ($scope, $routeParams, $window, $location) {
  $scope.bounty = {
    amount: parseInt($routeParams.amount, 10)
  };

  $scope.place_bounty_redirect = function(amount) {
    amount = amount || $scope.bounty.amount;
    if (angular.isNumber(amount)) {
      $location.path("/issues/"+$routeParams.id+"/bounty").search({ amount: amount });
    }
  };
});
