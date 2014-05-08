'use strict';
angular.module('app').controller('BountyBoxController', function ($scope, $routeParams, $window, $location, $analytics, $currency, $cart) {

  $scope.bounty = {
    amount: parseInt($routeParams.amount, 10) || null
  };

  function addBountyToCart(amount, currency) {
    currency = currency || $currency.value;

    // Button values are hardocded with USD. Conver if needed
    var converted = $currency.convert(amount, 'USD', $currency.value);

    return $cart.addBounty({
      amount: converted,
      currency: currency,
      issue_id: $routeParams.id
    });
  }

  $scope.place_bounty_redirect = function (amount) {
    // Track bounty start event in Mixpanel
    $analytics.bountyStart({ type: 'buttons', amount: amount });

    addBountyToCart(amount).then(function () {
      $location.url("/cart");
    });
  };

  $scope.custom_bounty_redirect = function () {
    $analytics.bountyStart({ type: 'custom', amount: $scope.bounty.amount });

    addBountyToCart($scope.bounty.amount).then(function () {
      $location.url("/cart");
    });
  };

});
