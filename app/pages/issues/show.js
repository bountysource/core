'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id', {
        templateUrl: 'pages/issues/show.html',
        controller: 'IssueShow'
      });
  })

  .controller('IssueShow', function ($scope, $routeParams, $window, $location, $payment, $api) {
    $scope.bounty = {
      amount: parseInt($routeParams.amount, 10),
      anonymous: $routeParams.anonymous || false,
      payment_method: $routeParams.payment_method || 'google'
    };

    $scope.issue = $api.issue_get($routeParams.id).then(function(response) {
      // append item number now that we have issue
      $scope.bounty.item_number = "issues/"+response.id;

      $scope.create_payment = function() {
        var base_url = $window.location.href.replace(/\/issues.*$/,'');
        var payment_params = angular.copy($scope.bounty);

        payment_params.success_url = base_url + "/activity/bounties";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) {
            console.log("Payment Error:", response);
          },

          noauth: function() {
            $api.set_post_auth_redirect({
              path: "/issues/" + $scope.issue.id,
              params: payment_params
            });

            $location.url("/signin");
          }
        });
      };

      return response;
    });

    $scope.status_for_solution = function(solution) {
      if (!solution.submitted) {
        return 'started';
      } else if (solution.submitted && !solution.merged) {
        return 'pending_merge';
      } else if (solution.in_dispute_period && !solution.disputed) {
        return 'in_dispute_period';
      } else if (solution.disputed) {
        return 'disputed';
      } else if (solution.rejected) {
        return 'rejected';
      } else if (solution.accepted) {
        return 'accepted';
      }
    };

    $scope.row_class_for_solution = function(solution) {
      var status = $scope.status_for_solution(solution);

      if (status === 'started') {
        return;
      } else if (status === 'pending_merge') {
        return 'warning';
      } else if (status === 'in_dispute_period') {
        return 'info';
      } else if (status === 'disputed') {
        return 'warning';
      } else if (status === 'rejected') {
        return 'error';
      } else if (status === 'accepted') {
        return 'success';
      }
    };
  });

