'use strict';

angular.module('app').controller('CreateBountyController', function ($scope, $rootScope, $routeParams, $window, $location, $api, $filter, $cart, $currency) {
  $scope.$currency = $currency;

  $scope.cart_promise = $cart.load().then(function(cart) {
    $scope.cart = cart;
    return cart;
  });

  // set follow tracker to true by default
  $scope.following = true;

  $scope.bounty = {
    amount: $currency.amountParamsParser($routeParams.amount) || null,
    currency: $routeParams.currency || $currency.value,
    anonymous: (parseInt($routeParams.anonymous, 10) === 1) || false,
    checkout_method: $currency.isBTC() ? 'coinbase' : $routeParams.checkout_method,
    bounty_expiration: $routeParams.bounty_expiration || '',
    upon_expiration: $routeParams.upon_expiration || '',
    promotion: $routeParams.promotion || '',

    // only used to alter the displayed amount,
    // not actually sent in the payment process request.
    fee: 0,
    total: parseInt($routeParams.amount, 10)
  };

  //Logic to show bounty_options template

  //created a custom event. Multiple ng includes made it hard to pin point the event
  $scope.broadcastLoad = function () {
    $rootScope.$emit("$load_expiration_options");
  };

  // randomly includes partial
  $scope.expiration = Math.floor(Math.random()*2);

  $api.issue_get($routeParams.id).then(function(issue) {
    $scope.tracker_id = issue.tracker.id;
    $scope.issue = issue;
    return issue;
  });

  // if logged in, populate teams accounts!
  $scope.$watch("current_person", function(person) {
    if (person) {
      // select the team once loaded.
      // if it's enterprise, then we need to know so that we hide the fees
      $api.person_teams(person.id).then(function(teams) {
        // oh god, that's like the wost line of JS I have ever written
        var team_id = parseInt(((($scope.bounty.checkout_method).match(/^team\/(\d+)$/) || {})[1]), 10);

        if (team_id) {
          for (var i=0; i<teams.length; i++) {
            if (teams[i].id === team_id) {
              $scope.selected_team = teams[i];
              break;
            }
          }
        }

        $scope.teams = teams;
        return teams;
      });

      $api.user_issue_bounty_total(parseInt($routeParams.id, 10)).then(function(response) {
        $scope.previous_bounty_total = response.bounty_total;
      });
    }
  });

});
