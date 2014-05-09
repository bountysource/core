'use strict';
angular.module('app').controller('BountyBoxController', function ($scope, $routeParams, $window, $location, $analytics, $currency, $cart) {

  $scope.bounty = {
    amount: parseInt($routeParams.amount, 10) || null
  };

  function addBountyToCart(amount) {
    return $cart.addBounty({
      amount: amount,
      currency: $currency.value,
      issue_id: $routeParams.id
    }).then(function () {
      $location.url("/cart");
    });;
  }

  $scope.place_bounty_redirect = function (amount) {
    // Track event
    $analytics.bountyStart({ type: 'buttons', amount: amount });

    // Button values are hardocded with USD. Conver if needed
    var converted = $currency.convert(amount, 'USD', $currency.value);

    // Add to cart and redirect
    addBountyToCart(converted);
  };

  $scope.custom_bounty_redirect = function (amount) {
    // track event
    $analytics.bountyStart({ type: 'custom', amount: amount });

    // Add to cart and redirect
    addBountyToCart(amount);
  };

});
