'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/:id/account', {
        templateUrl: 'pages/teams/account.html',
        controller: 'BaseTeamController',
        resolve: $person
      });
  })
  .controller('TeamAccountController', function ($scope, $routeParams, $location, $api, $payment, $window) {
    $scope.$watch('is_admin', function(value) {
      if (value === false) {
        $location.path("/teams/"+$routeParams.id).replace();
      }
    });

    $scope.pay_in = {
      amount: 0,
      item_number: "",
      payment_method: "google",

      // only used to alter the displayed amount,
      // not actually sent in the payment process request.
      fee: 0,
      total: 0
    };

    $scope.$watch('pay_in.amount', function() {
      $scope.pay_in.fee = ($scope.pay_in.amount || 0) * 0.10;
      $scope.pay_in.total = ($scope.pay_in.amount||0) + $scope.pay_in.fee;
    });

    $scope.team.then(function(team) {
      $scope.pay_in.item_number = "teams/"+team.id;
    });

    // build the create payment method
    $scope.create_payment = function() {
      if ($scope.pay_in.amount && angular.isNumber($scope.pay_in.amount)) {
        var payment_params = angular.copy($scope.pay_in);

        payment_params.success_url = $window.location.protocol + "//" + $window.location.host + "/teams/" + $routeParams.id + "?funds_added=" + $scope.pay_in.amount;
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) {
            // if response is forbidden, the person cannot add money to the team account.
            if (response.meta.status === 403) {
              $scope.error = "You are not authorized to add funds to the team account.";
            } else {
              $scope.error = response.data.error;
            }
          },

          noauth: function(response) {
            $api.set_post_auth_url("/fundraisers/" + response.slug + "/pledge", payment_params);
            $location.url("/signin");
          }
        });
      }
    };
  });