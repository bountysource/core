'use strict';

angular.module('app').controller('TeamAccountController', function ($scope, $routeParams, $location, $cart, $api) {
  $scope.cart_promise = $cart.load().then(function(cart) {
    $scope.cart = cart;
    return cart;
  });

  $scope.pay_in = {
    amount: $routeParams.amount || 0,
    checkout_method: 'google',

    // only used to alter the displayed amount,
    // not actually sent in the payment process request.
    fee: 0,
    total: 0
  };

  $scope.$watch('pay_in.amount', function() {
    $scope.pay_in.fee = ($scope.pay_in.amount || 0) * 0.10;
    $scope.pay_in.total = ($scope.pay_in.amount||0) + $scope.pay_in.fee;
  });

  // build the create payment method
  $scope.create_payment = function() {
    $scope.$watch('current_person', function (current_person) {
      if(current_person) {
        if ($scope.pay_in.amount && angular.isNumber($scope.pay_in.amount)) {
          // wow, so spaghetti
          $scope.team_promise.then(function(team) {
            $scope.cart_promise.then(function(cart) {
              $scope.processing_payment = true;

              var successCallback = function(response) {
                console.log('Payment success!', response);
              };

              var errorCallback = function(response) {
                console.log('Payment error', response);
                $scope.processing_payment = false;

                if (response.data && response.data.error) {
                  $scope.error = response.data.error;
                //hacky grossness. Payment redirect probably shoudln't return 302
                } else if (response.meta.status === 302) {
                  // don't assign scope.error
                } else {
                  $scope.error = "Something went wrong. Please try again, or contact support@bountysource if you see the error again.";
                }
              };

              cart.clear().then(function() {
                cart.add_team_payin($scope.pay_in.amount, team).then(function(response) {
                  if(!response.error) {
                    cart.checkout($scope.pay_in.checkout_method).then(successCallback, errorCallback);
                  } else {
                    $scope.error = response.error;
                  }
                });
              });
            });
          });
        }
      } else {
        $api.require_signin($location.path(), $location.search());
      }
    });
  };
});
