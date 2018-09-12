angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.checkout.payment', {
    parent: 'root.checkout.authed',
    url: "/checkout/payment?team&amount&display_as&reward_id&support_level_id&frequency",
    title: "Payment Method - Checkout",
    templateUrl: "salt/checkout/payment.html",
    container: false,
    controller: function($scope, $state, $stateParams, $api, $window, $env, payment_methods) {
      $scope.payment_methods = payment_methods;
      $scope.form_data = {
        payment_method: ($scope.support_level && $scope.support_level.payment_method.id) || "",
        bountysource_team_supported: false,
        bountysource_team_amount: 5
      };

      var support_create_error = function(response) {
        $scope.error = response.data.error;
        $scope.form_data.$processing = false;
        $scope.form_data.$more_processing = false;
      };

      $scope.submit_form = function() {
        $scope.error = null;
        $scope.form_data.$processing = true;
        $scope.form_data.$more_processing = false;

        // fields relating to the support level itself, not the payment method
        var support_level_params = {
          amount: $stateParams.amount,
          display_as: $stateParams.display_as,
          team_id: $scope.team.id,
          reward_id: $stateParams.reward_id,
          id: $stateParams.support_level_id
        };
        if ($scope.form_data.bountysource_team_supported) {
          support_level_params.bountysource_team_amount = $scope.form_data.bountysource_team_amount;
        }
        var create_or_update_support_level = $stateParams.support_level_id ? $api.support_levels.update : $api.support_levels.create;

        if ($scope.form_data.payment_method === 'stripe') {
          var handler = StripeCheckout.configure({
            key: $env.stripe_key,
            image: $env.stripe_image,
            token: function(token) {
              $scope.form_data.$more_processing = true;
              support_level_params.payment_method_id = 'stripe:' + token.id;
              create_or_update_support_level(support_level_params, function(response) {
                $state.transitionTo('root.support_levels.show', response);
              }, support_create_error);
            }
          });

          // Open Checkout with further options
          handler.open({
            name: 'Bountysource',
            allowRememberMe: false,
            zipCode: true,
            email: $scope.person.email,
            panelLabel: "Confirm Purchase",
            closed: function() {
              if (!$scope.form_data.$more_processing) {
                $scope.form_data.$processing = false;
                $scope.$digest();
              }
            }
          });

          // Close Checkout if user hits back/forward button
          $window.addEventListener('popstate', function(event) {
            handler.close();
          });

        } else if ($scope.form_data.payment_method === 'paypal') {
          // add new paypal account
          support_level_params.payment_method_id = 'paypal';
          support_level_params.success_url = $state.href('root.support_levels.show', { id: ':id' }, { absolute: true });
          support_level_params.cancel_url = $state.href('root.checkout.payment', $stateParams, { absolute: true });
          create_or_update_support_level(support_level_params, function(response) {
            $window.location.href = response.redirect_to;
          }, support_create_error);
        } else {
          // pre-existing payment method
          support_level_params.payment_method_id = $scope.form_data.payment_method;
          create_or_update_support_level(support_level_params, function(response) {
            $state.transitionTo('root.support_levels.show', response);
          }, support_create_error);
        }
      };

    },
    resolve: {
      payment_methods: function($api, $stateParams) {
        return $api.payment_methods.query().$promise;
      }
    }
  });
});
