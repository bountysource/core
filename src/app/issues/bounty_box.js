'use strict';
angular.module('app').controller('BountyBoxController', function ($scope, $routeParams, $window, $location, $analytics, $currency, $cart) {

  $scope.bounty = {
    amount: parseInt($routeParams.amount, 10) || null
  };

  function addBountyToCart(amount, currency) {
    currency = currency || $currency.value;
    return $cart.addBounty({
      amount: amount,
      currency: currency,
      issue_id: $routeParams.id
    });
  }

  $scope.place_bounty_redirect = function (amount) {
    // Track bounty start event in Mixpanel
    $analytics.bountyStart({ type: 'buttons', amount: amount });

    addBountyToCart(amount).$promise.then(function () {
      $location.url("/cart");
    });
  };

  $scope.custom_bounty_redirect = function () {
    $analytics.bountyStart({ type: 'custom', amount: $scope.bounty.amount });

    addBountyToCart($scope.bounty.amount).$promise.then(function () {
      $location.url("/cart");
    });
  };

});
