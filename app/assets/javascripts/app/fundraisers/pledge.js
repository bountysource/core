'use strict';

angular.module('fundraisers').controller('FundraiserPledgeController', function ($scope, $routeParams, $window, $location, $api, $cart) {
  $scope.cart_promise = $cart.load().then(function(cart) {
    $scope.cart = cart;
    return cart;
  });

  $scope.pledge = {
    amount: parseInt($routeParams.amount, 10) || 100,
    anonymous: (parseInt($routeParams.anonymous, 10) === 1) || false,
    checkout_method: $routeParams.checkout_method || "google",
    survey_response: $routeParams.survey_response || "",
    reward_id: parseInt($routeParams.reward_id, 10) || 0
  };

  $scope.fundraiser_hide_pledge_button = true;

  $scope.fundraiserPromise.then(function(fundraiser) {
    if (fundraiser.published && !fundraiser.in_progress) {
      $location.url("/fundraisers/" + fundraiser.slug);
    }

    // add the base item number, with just fundraisers id
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
      // request payload
      var attrs = angular.copy($scope.pledge);

      $scope.$watch('current_person', function(person) {
        if (person) {
          $scope.processing_payment = true;

          // remove checkout method from payload
          var checkout_method = attrs.checkout_method;
          delete attrs.checkout_method;

          // callbacks for cart checkout
          var successCallback = function(response) {
            console.log('Checkout success!', response);
          };
          var errorCallback = function(response) {
            $scope.processing_payment = false;
            $scope.alert = { message: response.data.error, type: 'danger' };
          };

          // wow, so spaghetti
          $scope.cart_promise.then(function(cart) {
            cart.clear().then(function() {
              cart.add_pledge($scope.pledge.amount, fundraiser, attrs).then(function() {
                cart.checkout(checkout_method).then(successCallback, errorCallback);
              });
            });
            return cart;
          });
        } else if (person === false) {
          // turn anon bool into 1 or 0
          var anon = (attrs.anonymous === true ? 1 : 0);
          attrs.anonymous = anon;

          // save route, redirect to login
          $api.set_post_auth_url($location.path(), attrs);
          $location.url("/signin");
        }
      });
    };

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
      $scope.teams_promise = $api.person_teams(person.id).then(function (response) {
        $scope.teams = response;
        return response;
      });
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
