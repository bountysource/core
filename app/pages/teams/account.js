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
      payment_method: "google"
    };

    $scope.team.then(function(team) {
      $scope.pay_in.item_number = "teams/"+team.id
    });

    // build the create payment method
    $scope.create_payment = function() {
      var payment_params = angular.copy($scope.pay_in);

      payment_params.success_url = $window.location.href;
      payment_params.cancel_url = $window.location.href;

      $payment.process(payment_params, {
        error: function(response) { console.log("Payment Error:", response); },

        noauth: function(response) {
          $api.set_post_auth_url("/fundraisers/" + response.slug + "/pledge", payment_params);
          $location.url("/signin");
        }
      });
    };
  });