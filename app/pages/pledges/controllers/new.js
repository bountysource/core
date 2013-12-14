'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledge', {
        templateUrl: 'pages/pledges/new.html',
        controller: 'FundraiserPledgeCreateController'
      });
  })

  .controller('FundraiserPledgeCreateController', function ($scope, $routeParams, $window, $location, $api, $cart) {
    $scope.cart_promise = $cart.load().then(function(cart) {
      $scope.cart = cart;
      return cart;
    });

    $scope.pledge = {
      amount: parseInt($routeParams.amount, 10) || 100,
      anonymous: ($routeParams.anonymous === "true") || false,
      checkout_method: $routeParams.checkout_method || "google",
      survey_response: $routeParams.survey_response || "",
      reward_id: parseInt($routeParams.reward_id, 10) || 0
    };

    $scope.fundraiser_hide_pledge_button = true;

    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(fundraiser) {
      // add the base item number, with just fundraiser id
      $scope.pledge.base_item_number = 'fundraisers/'+fundraiser.id;
      $scope.pledge.item_number = $scope.pledge.base_item_number;

      if ($scope.pledge.reward_id) {
        $scope.pledge.item_number += "/" + $scope.pledge.reward_id;
      }

      // select reward to have the object cached. handled after this by set_reward(reward)
      $scope.selected_reward = null;
      for (var i=0; $scope.pledge.reward_id && i<fundraiser.rewards.length; i++) {
        if (fundraiser.rewards[i].id === $scope.pledge.reward_id) {
          $scope.selected_reward = fundraiser.rewards[i];
          break;
        }
      }

      // build the create payment method
      $scope.create_payment = function() {
        $scope.processing_payment = true;

        var attrs = angular.copy($scope.pledge);
        var checkout_method = attrs.checkout_method;
        delete attrs.checkout_method;

        // wow, so spaghetti
        $scope.cart_promise.then(function(cart) {
          cart.clear().then(function() {
            cart.add_pledge($scope.pledge.amount, fundraiser, attrs).then(function() {
              cart.checkout(checkout_method).then(function(success) {
                if (success === false) {
                  $scope.processing_payment = false;
                }
              });
            });
          });

          return cart;
        });
      };

      $scope.fundraiser = fundraiser;
      return fundraiser;
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
    $scope.$watch("pledge.checkout_method", function(checkout_method) {
      if ((/^team\/\d+$/).test(checkout_method)) {
        $scope.can_make_anonymous = false;
      } else {
        $scope.can_make_anonymous = true;
      }
    });
  });
