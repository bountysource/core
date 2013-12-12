'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/bounty', {
        templateUrl: 'pages/issues/bounty.html',
        controller: 'IssuesBaseController'
      });
  })

  .controller('CreateBountyController', function ($scope, $rootScope, $routeParams, $window, $location, $api, $filter, $cart) {
    $scope.cart_promise = $cart.load().then(function(cart) {
      $scope.cart = cart;
      return cart;
    });

    $scope.bounty = {
      amount: parseInt($routeParams.amount || 0, 10),
      anonymous: ($routeParams.anonymous === "true") || false,
      checkout_method: $routeParams.checkout_method || 'google',

      // only used to alter the displayed amount,
      // not actually sent in the payment process request.
      fee: 0,
      total: parseInt($routeParams.amount || 0, 10)
    };

    //Logic to show bounty_options template

    //created a custom event. Multiple ng includes made it hard to pin point the event
    $scope.broadcastLoad = function () {
      $rootScope.$emit("$load_expiration_options");
    };

    // randomly includes partial
    $scope.expiration = Math.floor(Math.random()*2);

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      $scope.bounty.item_number = "issues/"+issue.id;

      $scope.create_payment = function() {
        $scope.cart_promise.then(function(cart) {
          var attrs = angular.copy($scope.bounty);
          var checkout_method = attrs.checkout_method;
          delete attrs.checkout_method;
          delete attrs.fee;

          $scope.processing_payment = true;

          // wow, so spaghetti
          cart.clear().then(function() {
            cart.add_bounty($scope.bounty.amount, issue, attrs).then(function() {
              cart.checkout(checkout_method).then(function() {
                $scope.processing_payment = false;
              });
            });
          });

          return cart;
        });
      };

      return issue;
    });

    // if logged in, populate teams accounts!
    $scope.$watch("current_person", function(person) {
      if (person) {
        // select the team once loaded.
        // if it's enterprise, then we need to know so that we hide the fees
        $scope.teams = $api.person_teams(person.id).then(function(teams) {
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
    $scope.has_fee = true;
    $scope.show_fee = false;

    $scope.$watch("bounty.checkout_method", function(checkout_method) {
      if (checkout_method) {

        if ((/^team\/\d+$/).test(checkout_method)) {
          $scope.has_fee = false;
          $scope.show_fee = false;
        } else if (checkout_method === "personal") {
          $scope.has_fee = false;
          $scope.show_fee = false;
        } else {
          $scope.has_fee = true;
          $scope.show_fee = true;
        }

        // Cannot make anon if payment method is a team
        $scope.can_make_anonymous = !(/^team\/\d+$/).test(checkout_method);
      }
    });

    // when fee changes, so does the total
    $scope.$watch("has_fee", function(has_fee) {
      if (has_fee === true) {
        $scope.bounty.fee = $scope.bounty.total * 0.10;
        $scope.bounty.total += $scope.bounty.fee;
      } else if (has_fee === false) {
        $scope.bounty.total -= $scope.bounty.fee;
        $scope.bounty.fee = 0;
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

    $scope.update_bounty_amount = function() {
      var total = $scope.bounty.total;
      if (angular.isNumber(total)) {
        var fee = (total * 0.1) / 1.1;
        fee = Number($filter('number')(fee, 2).replace(/[^0-9|\.]/g, ''));
        var amount = total / 1.1;
        amount = Number($filter('number')(amount, 2).replace(/[^0-9|\.]/g, ''));
        $scope.bounty.fee = $scope.has_fee ? fee : 0;
        $scope.bounty.amount = $scope.has_fee ? amount : total;
      } else {
        $scope.bounty.amount = 0;
        $scope.bounty.fee = 0;
      }
    };

    $scope.update_bounty_total = function() {
      var amount = $scope.bounty.amount;
      if (angular.isNumber(amount)) {
        var fee = amount * 0.10;
        fee = Number($filter('number')(fee, 2).replace(/[^0-9|\.]/g, ''));
        amount = Number($filter('number')(amount, 2).replace(/[^0-9|\.]/g, ''));
        $scope.bounty.fee = $scope.has_fee ? fee : 0;
        $scope.bounty.total = $scope.has_fee ? Number($filter('number')(amount + fee, 2).replace(/[^0-9|\.]/g, '')) : amount;
      } else {
        $scope.bounty.total = 0;
        $scope.bounty.fee = 0;
      }
    };

    $scope.set_bounty_amount = function(new_amount) {
      if (new_amount > $scope.bounty.amount) {
        $scope.bounty.amount = new_amount;
        $scope.update_bounty_total();
      }
    };
  });

