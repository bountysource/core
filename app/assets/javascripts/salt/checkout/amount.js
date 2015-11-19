angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.checkout.amount', {
    url: "/checkout/amount?team&amount&display_as&reward_id&support_level_id&frequency",
    title: "Amount - Checkout",
    templateUrl: "salt/checkout/amount.html",
    container: false,
    controller: function($scope, $state, $stateParams, $window, $env) {
      $scope.form_data = {};
      if ($stateParams.amount) {
        $scope.form_data.amount = $stateParams.amount;
      } else if ($scope.support_level && (!$scope.support_level.reward || ($scope.support_level.reward.amount !== $scope.support_level.amount))) {
        // prefill amount unless we're editing a support level and the amount is the same as reward
        $scope.form_data.amount = $scope.support_level.amount;
      }

      if ($stateParams.frequency) {
        $scope.form_data.frequency = $stateParams.frequency;
      } else {
        // prefill amount unless we're editing a support level and the amount is the same as reward
        $scope.form_data.frequency = 'monthly';
      }

      if ($stateParams.reward_id) {
        $scope.form_data.reward_id = $stateParams.reward_id;
      } else if ($scope.support_level && $scope.support_level.reward) {
        $scope.form_data.reward_id = $scope.support_level.reward.id;
      } else {
        $scope.form_data.reward_id = 0;
      }

      $scope.reward_clicked = function(reward) {
        $scope.current_reward = reward;
      };
      // handle initial focusing of reward (to auto-fill the amount placeholder)
      if ($scope.form_data.reward_id) {
        for (var i=0; i < $scope.team.support_offering.rewards.length; i++) {
          if ($scope.team.support_offering.rewards[i].id === parseInt($scope.form_data.reward_id)) {
            $scope.reward_clicked($scope.team.support_offering.rewards[i]);
            break;
          }
        }
      }

      $scope.submit_form = function() {
        $scope.error = null;
        if ($scope.form_data.amount) {
          var parsed_amount = parseFloat($scope.form_data.amount);
          if (!parsed_amount) {
            $scope.error = 'Amount not valid.';
          } else if (parsed_amount < 1.0) {
            $scope.error = 'Amount must be $1 or more,';
          } else if (parsed_amount > 10000.0) {
            $scope.error = 'Please contact support@bountysource.com for any amount greater than $10,000.';
          } else if ($scope.current_reward && (parsed_amount < $scope.current_reward.amount)) {
            $scope.error = 'The reward you selected requires a higher amount.';
          }
        } else if (!$scope.form_data.reward_id || (parseInt($scope.form_data.reward_id) === 0)) {
          $scope.error = 'Amount is required.';
        }

        // yay, no errors!
        if (!$scope.error) {
          if ($scope.form_data.frequency === 'monthly') {
            $state.transitionTo('root.checkout.display', angular.extend({}, $stateParams, $scope.form_data));
          } else {
            $window.location.href = $env.www_host + 'cart?team_id='+$stateParams.team+'&amount=' + parsed_amount;
          }
        }
      };
    }
  });
});
