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
        payment_params.success_url = base_url + "/issues/"+issue.id+"/receipts/recent";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) {
            // if paying from team, but not a spender
            if ((/\Ateam\/(\d+)\Z/).test(payment_params.payment_method) && response.meta.status === 403) {
              console.log("Forbidden:", response);
              $scope.error = "You do not have permission to do that.";
            } else {
              $scope.error = response.data.error;
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

    $scope.selected_team = undefined;
      $scope.select_team = function(team) {
      $scope.selected_team = team;
    };

    $scope.can_make_anonymous = true;
    $scope.has_fee = true;

    $scope.$watch("bounty.payment_method", function(payment_method) {
      if (payment_method) {
        // is it an enterprise team or personal account? No fee!
        if ((/^team\/\d+$/).test(payment_method) && $scope.selected_team && (/^Team::Enterprise$/).test($scope.selected_team.type||"")) {
          $scope.has_fee = false;
        } else if (payment_method === "personal") {
          $scope.has_fee = false;
        } else {
          $scope.has_fee = true;
        }
      }
    });

    // when fee changes, so does the total
    $scope.$watch("has_fee", function(has_fee) {
      if (has_fee === true) {
        $scope.bounty.fee = $scope.bounty.total * 0.10;
        $scope.bounty.total += $scope.bounty.fee;
      } else if (has_fee === false) {
        $scope.bounty.total -= $scope.bounty.fee;
        $scope.bounty.fee = 0;
      }
    });

    $scope.update_bounty_amount = function() {
      var total = $scope.bounty.total;
      if (angular.isNumber(total)) {
        var fee = (total * 0.1) / 1.1;
        fee = Number($filter('number')(fee, 2).replace(/[^0-9|\.]/g, ''));
        var amount = total / 1.1;
        amount = Number($filter('number')(amount, 2).replace(/[^0-9|\.]/g, ''));
        $scope.bounty.fee = $scope.has_fee ? fee : 0;
        $scope.bounty.amount = $scope.has_fee ? amount : total;
      } else {
        $scope.bounty.amount = 0;
        $scope.bounty.fee = 0;
      }
    };

    $scope.update_bounty_total = function() {
      var amount = $scope.bounty.amount;
      if (angular.isNumber(amount)) {
        var fee = amount * 0.10;
        fee = Number($filter('number')(fee, 2).replace(/[^0-9|\.]/g, ''));
        amount = Number($filter('number')(amount, 2).replace(/[^0-9|\.]/g, ''));
        $scope.bounty.fee = $scope.has_fee ? fee : 0;
        $scope.bounty.total = $scope.has_fee ? Number($filter('number')(amount + fee, 2).replace(/[^0-9|\.]/g, '')) : amount;
      } else {
        $scope.bounty.total = 0;
        $scope.bounty.fee = 0;
      }
    };
  });

