angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.checkout.one_time_payment', {
    parent: 'root.checkout.authed',
    url: "/checkout/one_time_payment?team&amount&display_as&reward_id&support_level_id&frequency",
    title: "Payment Method - Checkout",
    templateUrl: "salt/checkout/one_time_payment.html",
    container: false,
    controller: function($scope, $state, $stateParams, $api, $window, $env, teams) {
      $scope.form_data = {
        amount: $stateParams.amount
      };

      $scope.teams = teams;

      $scope.submit_form = function() {
        var team_payin_params = {
          amount: parseFloat($stateParams.amount),
          team_id: $scope.team.id,
          item_type: 'team_payin',
          currency: 'USD',
          total: parseFloat($stateParams.amount)
        };

        if ($stateParams.display_as === 'me') {
          team_payin_params.owner_type = "Person";
          team_payin_params.owner_id = $scope.person.id;
        } else if ($stateParams.display_as === 'anonymous') {
          team_payin_params.owner_type = null;
          team_payin_params.owner_id = null;
        } else {
          team_payin_params.owner_type = "Team";
          team_payin_params.owner_id = $stateParams.display_as.split("Team")[1];
        }

        $api.one_time_checkout.create({}, {
          team_payin: team_payin_params, checkout_method: $scope.form_data.checkout_method
        }, function(response){
          $window.location = response.checkout_url;
        });
      };
    },
    resolve: {
      teams: function($api, person) {
        return $api.person_teaams.query({person_id: person.id}).$promise;
      }
    }
  });
});
