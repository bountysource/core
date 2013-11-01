'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledge', {
        templateUrl: 'pages/pledges/new.html',
        controller: 'FundraiserPledgeCreateController'
      });
  })

  .controller('FundraiserPledgeCreateController', function ($scope, $routeParams, $window, $location, $payment, $api) {
    $scope.pledge = {
      amount: parseInt($routeParams.amount, 10) || 100,
      anonymous: ($routeParams.anonymous === "true") || false,
      payment_method: $routeParams.payment_method || "google",
      survey_response: $routeParams.survey_response || "",
      reward_id: parseInt($routeParams.reward_id, 10) || 0
    };

    $scope.fundraiser_hide_pledge_button = true;

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      // add the base item number, with just fundraiser id
      $scope.pledge.base_item_number = 'fundraisers/'+response.id;
      $scope.pledge.item_number = $scope.pledge.base_item_number;

      if ($scope.pledge.reward_id) {
        $scope.pledge.item_number += "/" + $scope.pledge.reward_id;
      }

      // select reward to have the object cached. handled after this by set_reward(reward)
      $scope.selected_reward = null;
      for (var i=0; $scope.pledge.reward_id && i<response.rewards.length; i++) {
        if (response.rewards[i].id === $scope.pledge.reward_id) {
          $scope.selected_reward = response.rewards[i];
          break;
        }
      }

      // build the create payment method
      $scope.create_payment = function() {
        var base_url = $window.location.href.replace(/\/fundraisers.*$/,'');
        var payment_params = angular.copy($scope.pledge);
        payment_params.success_url = base_url + "/fundraisers/"+response.id+"/receipts/recent";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) { console.log("Payment Error:", response); },

          noauth: function() {
            $api.set_post_auth_url("/fundraisers/" + response.slug + "/pledge", payment_params);
            $location.url("/signin");
          }
        });
      };

      return response;
    });

    $scope.set_reward = function(reward) {
      $scope.selected_reward = reward;
      $scope.pledge.reward_id = reward.id || 0;

      // add reward item to item number
      if ($scope.selected_reward) {
        $scope.pledge.item_number = $scope.pledge.base_item_number + '/' + reward.id;
      } else {
        $scope.pledge.item_number = $scope.pledge.base_item_number;
      }

      // if the reward amount is higher than current pledge amount, raise it.
      if (reward.amount && (!$scope.pledge.amount || $scope.pledge.amount < reward.amount)) {
        $scope.pledge.amount = reward.amount;
      }
    };

    // if logged in, populate teams accounts!
    $scope.$watch("current_person", function(person) {
      if (person) {
        $scope.teams = $api.person_teams(person.id);
      }
    });

    $scope.can_make_anonymous = true;
    // watch payment method for team account.
    // if it is, disable the anonymous checkbox
    $scope.$watch("pledge.payment_method", function(payment_method) {
      if ((/^team\/\d+$/).test(payment_method)) {
        $scope.can_make_anonymous = false;
      } else {
        $scope.can_make_anonymous = true;
      }
    });
  });
