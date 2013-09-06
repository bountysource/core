'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/bounty', {
        templateUrl: 'pages/issues/bounty.html',
        controller: 'IssueShow'
      });
  })

  .controller('CreateBountyController', function ($scope, $routeParams, $window, $location, $payment, $api, $filter) {
    $scope.bounty = {
      amount: parseInt($routeParams.amount || 0, 10),
      anonymous: ($routeParams.anonymous === "true") || false,
      payment_method: $routeParams.payment_method || 'google',

      // only used to alter the displayed amount,
      // not actually sent in the payment process request.
      fee: 0,
      total: parseInt($routeParams.amount || 0, 10)
    };

    $scope.issue.then(function(issue) {
      $scope.bounty.item_number = "issues/"+issue.id;

      $scope.create_payment = function() {
        var base_url = $window.location.href.replace(/\/issues.*$/,'');
        var payment_params = angular.copy($scope.bounty);

        delete payment_params.fee;
        payment_params.success_url = base_url + "/activity/bounties";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) {
            // if paying from team, but not a spender
            if ((/\Ateam\/(\d+)\Z/).test(payment_params.payment_method) && response.meta.status === 403) {
              console.log("Forbidden:", response);
            } else {
              console.log("Payment Error:", response);
            }
          },

          noauth: function() {
            $api.set_post_auth_url("/issues/"+$routeParams.id+"/bounty", payment_params);
            $location.url("/signin");
          }
        });
      };

      return issue;
    });

    // if logged in, populate teams accounts!
    $scope.$watch("current_person", function(person) {
      if (person) {
        $scope.teams = $api.person_teams(person.id);
      }
    });

    $scope.can_make_anonymous = true;

    // watch payment method for team account.
    // if it is, disable the anonymous checkbox
    $scope.$watch("bounty.payment_method", function(payment_method) {
      if ((/^team\/\d+$/).test(payment_method)) {
        $scope.can_make_anonymous = false;
      } else {
        $scope.can_make_anonymous = true;
      }
    });

    $scope.$watch("bounty.amount", function(amount) {
      if (angular.isNumber(amount)) {
        $scope.bounty.fee = $filter('currency')(amount * 0.10);
        $scope.bounty.total = $filter('currency')(amount * 1.10);
      } else {
        $scope.bounty.fee = $filter('currency')(0);
        $scope.bounty.total = $filter('currency')(0);
      }
    });
  });

