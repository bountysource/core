'use strict';
angular.module('app').controller('BountyBoxController', function ($scope, $routeParams, $window, $location, $analytics, $currency, $cart) {
  $scope.bounty = {
    amount: parseInt($routeParams.amount, 10)
  };

  function convertCurrency (amount) {
    if (amount && $currency.isBTC()) {
      amount = $currency.usdToBtc(amount);
    }
    return amount;
  }

  $scope.place_bounty_redirect = function (amount) {
    amount = convertCurrency(amount) || $scope.bounty.amount;

    // Track bounty start event in Mixpanel
    $analytics.bountyStart({ type: 'buttons', amount: amount });

    $cart.addBounty({
      amount: amount,
      currency: $currency.value,
      issue_id: $routeParams.id
    }).$promise.then(function () {
        $location.url("/cart");
      });
  };

  $scope.custom_bounty_redirect = function () {
    $analytics.bountyStart({ type: 'custom', amount: $scope.bounty.amount });
    if (angular.isNumber($scope.bounty.amount)) {
      $location.url("/cart");
    }
  };
});
