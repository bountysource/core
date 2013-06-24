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
    $scope.active_tab = function(name) {
      if (name == 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
      if (name == 'comments' && (/^\/issues\/[a-z-_0-9]+\/comments$/).test($location.path())) { return "active"; }
      if (name == 'bounties' && (/^\/issues\/[a-z-_0-9]+\/bounties$/).test($location.path())) { return "active"; }
      if (name == 'solutions' && (/^\/issues\/[a-z-_0-9]+\/solutions$/).test($location.path())) { return "active"; }
    };

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
  });

