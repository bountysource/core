'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/:id/account', {
        templateUrl: 'pages/teams/account.html',
        controller: 'BaseTeamController',
        resolve: $person,
        reloadOnSearch: false
      });
  })
  .controller('TeamAccountController', function ($scope, $routeParams, $location, $api, $payment, $window) {
    $scope.$watch('is_admin', function(value) {
      if (value === false) {
        $location.path("/teams/"+$routeParams.id).replace();
      }
    });

    // pick off query string to show amount added to account
    if ($location.search().funds_added) {
      $scope.funds_added = parseInt($location.search().funds_added, 10) || undefined;
      $location.search({}).replace();
    }

    $scope.pay_in = {
      amount: 0,
      item_number: "",
      payment_method: "google"
    };

    $scope.team.then(function(team) {
      $scope.pay_in.item_number = "teams/"+team.id;
    });

    // build the create payment method
    $scope.create_payment = function() {
      if ($scope.pay_in.amount && angular.isNumber($scope.pay_in.amount)) {
        var payment_params = angular.copy($scope.pay_in);

        payment_params.success_url = $window.location.href+"?funds_added="+$scope.pay_in.amount;
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