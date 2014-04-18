'use strict';

angular.module('app').controller('CreateBountyController', function ($scope, $rootScope, $routeParams, $window, $location, $api, $filter, $cart) {
  $scope.cart_promise = $cart.load().then(function(cart) {
    $scope.cart = cart;
    return cart;
  });

  // set follow tracker to true by default
  $scope.following = true;

  $scope.bounty = {
    amount: parseInt($routeParams.amount, 10),
    anonymous: (parseInt($routeParams.anonymous, 10) === 1) || false,
    checkout_method: $routeParams.checkout_method || 'google',
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

    $scope.create_payment = function() {
      var attrs = angular.copy($scope.bounty);

      $scope.$watch('current_person', function(person) {
        if (person) {
          $scope.cart_promise.then(function(cart) {
            $scope.processing_payment = true;

            // remove checkout method
            var checkout_method = attrs.checkout_method;
            delete attrs.checkout_method;

            // checkout callbacks
            var successCallback = function(response) {
              console.log('Checkout success!', response);
            };

            var errorCallback = function(response) {
              response = response || {};

              $scope.processing_payment = false;

              if (response.data && response.data.error) {
                $scope.alert = { message: response.data.error, type: 'danger' };
              }
            };

            // wow, so spaghetti
            cart.clear().then(function() {
              cart.add_bounty($scope.bounty.amount, issue, attrs).then(function() {
                cart.checkout(checkout_method).then(successCallback, errorCallback);
              });
            });

            return cart;
          });
        } else if (person === false) {
          // turn anon bool into 1 or 0
          attrs.anonymous = (attrs.anonymous === true ? 1 : 0);

          // save route, redirect to login
          $api.set_post_auth_url($location.path(), attrs);
          $location.url("/signin");
        }
      });
    };

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

  $scope.selected_team = undefined;
  $scope.select_team = function(team) {
    $scope.selected_team = team;
  };

  $scope.can_make_anonymous = true;

  $scope.$watch("bounty.checkout_method", function(checkout_method) {
    if (checkout_method) {
      // Cannot make anon if payment method is a team
      $scope.can_make_anonymous = !(/^team\/\d+$/).test(checkout_method);
    }
  });

  $scope.promotion_disabled = {
    'newsletter': true,
    'feature': true,
    'tweet': true
  };

  $scope.$watch("bounty.amount", function(amount) {
    for (var key in $scope.promotion_disabled) {
      $scope.promotion_disabled[key] = $scope.update_promotion_disabled(key);
      if (key === $scope.bounty.promotion && $scope.promotion_disabled[key]) {
        $scope.bounty.promotion = undefined;
      }
    }
  });

  $scope.update_promotion_disabled = function(promotion) {
    var result;
    if ($scope.bounty.amount) {
      switch(promotion) {
      case 'newsletter':
        result = $scope.bounty.amount < 150 ? true : false;
        break;
      case 'tweet':
        result = $scope.bounty.amount < 150 ? true : false;
        break;
      case 'feature':
        result = $scope.bounty.amount < 50 ? true : false;
        break;
      default:
        result = true;
        break;
      }
    } else {
      result = true;
    }
    return result;
  };
});
