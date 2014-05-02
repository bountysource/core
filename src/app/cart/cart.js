'use strict';

angular.module('app').controller('ShoppingCartController', function($scope, $routeParams, $window, $location, $api, $cart, $log, $filter, $currency, $timeout, $q, ShoppingCart, ShoppingCartItem) {

  // Load shopping cart
  $cart.getInstance().then(function (cart) {
    $scope.cart = cart;
  });

  $scope.$watch('cart', function (cart) {
    if (angular.isObject(cart)) {
      for (var i=0; $scope.cart.items && i<$scope.cart.items.length; i++) {
        // Stupid: item amounts to float
        $scope.cart.items[i].amount = $window.parseFloat($scope.cart.items[i].amount) || null;

        // Initialize total
        $scope.cart.items[i].total = $scope.calculateItemTotal($scope.cart.items[i]);

        // For bounties, initialize the tweet boolean from promotion column.
        if ($scope.isBounty(cart.items[i]) && angular.isUndefined(cart.items[i].tweet)) {
          cart.items[i].tweet = cart.items[i].promotion === 'tweet';
        }
      }
    }
  }, true);

  $scope.checkoutPayload = {
    checkout_method: $routeParams.checkout_method || 'google',
    currency: $routeParams.currency || $currency.value
  };

  $scope.checkoutMethod = undefined;

  $scope.bountyExpirationOptions = [
    { value: null, description: 'Never' },
    { value: 3, description: '3 Months ($250 minimum)' },
    { value: 6, description: '6 Months ($100 minimum)' }
  ];

  $scope.bountyUponExpirationOptions = [
    { value: 'refund', description: 'Refund to my Bountysource account' },
    { value: 'donate to project', description: 'Donate to project' }
  ];

  // Load the current Person and their teams
  $scope.$watch('current_person', function (person) {
    if (person) {
      $api.person_teams_get(person.id).then(function (teams) {
        $scope.teams = angular.copy(teams);
      });
    }
  });

  $scope.isPledge = function (item) {
    return angular.isObject(item) && item.type === 'Pledge';
  };

  $scope.isBounty = function (item) {
    return angular.isObject(item) && item.type === 'Bounty';
  };

  $scope.isTeamPayin = function (item) {
    return angular.isObject(item) && item.type === 'TeamPayin';
  };

  $scope.updateItem = function (index) {
    var payload = $scope.getBaseItemAttributes($scope.cart.items[index]);

    return ShoppingCartItem.update({
      uid: $scope.cart.getUid(),
      index: index
    }, payload);
  };

  $scope.removeItem = function (index) {
    if ($window.confirm('Are you for real?')) {
      ShoppingCartItem.delete({
        uid: $scope.cart.getUid(),
        index: index
      });
      $scope.cart.items.splice(index,1);
    }
  };

  $scope.setOwner = function (index, type, owner) {
    var uid = $scope.cart.getUid();
    switch (type) {
      case ('anonymous'):
        $scope.cart.items[index].owner = {
          display_name: 'Anonymous',
          image_url: 'images/anon.jpg'
        };
        ShoppingCartItem.update({ index: index }, {
          uid: uid,
          owner_id: null,
          owner_type: null,
          anonymous: true
        });
        break;

      case ('person'):
        $scope.cart.items[index].owner = angular.copy(owner);
        ShoppingCartItem.update({ index: index }, {
          uid: uid,
          owner_id: owner.id,
          owner_type: 'Person',
          anonymous: false
        });
        break;

      case ('team'):
        $scope.cart.items[index].owner = angular.copy(owner);
        ShoppingCartItem.update({ index: index }, {
          uid: uid,
          owner_id: owner.id,
          owner_type: 'Team',
          anonymous: false
        });
        break;

      default:
        $log.error('Unexpected owner:', type, owner);
    }
  };

  $scope.getBaseItemAttributes = function(item) {
    var attributes = angular.copy(item);

    // Remove nested Fundraiser, Issue, or Team
    delete attributes.issue;
    delete attributes.fundraiser;
    delete attributes.team;

    // Remove owner, it is set independently
    delete attributes.owner;

    return attributes;
  };

  $scope.rewardChanged = function (index) {
    var item = $scope.cart.items[index];

    // Find reward from select value (reward id)
    for (var i=0; item && i<item.fundraiser.rewards.length; i++) {
      if (item.fundraiser.rewards[i].id === item.reward_id) {

        // Set reward object on item
        $scope.cart.items[index].reward = angular.copy(item.fundraiser.rewards[i]);

        // Set Pledge amount to reward amount if necessary
        if (item.amount < item.fundraiser.rewards[i].amount) {
          $scope.cart.items[index].amount = item.fundraiser.rewards[i].amount;
        }

        // Update item in cart
        $scope.updateItem(index);
      }
    }
  };

  $scope.bountyExpirationChanged = function (index) {
    var min, item = $scope.cart.items[index];

    switch (item.bounty_expiration) {
      case (3):
        min = $currency.convert(250, 'USD', $currency.value);
        if (item.amount < min) {
          $scope.cart.items[index].amount = min;
        }
        break;

      case (6):
        min = $currency.convert(100, 'USD', $currency.value);
        if (item.amount < min) {
          $scope.cart.items[index].amount = min;
        }
        break;
    }

    $scope.updateItem(index);
  };

  $scope.calculateItemTotal = function (item) {
    return $currency.convert(parseFloat(item.amount), item.currency, 'USD') + (item.tweet === true ? 20 : 0);
  };

  $scope.calculateCartTotal = function () {
    var total = 0.0;
    for (var i=0; $scope.cart && $scope.cart.items && i<$scope.cart.items.length; i++) {
      total += $scope.cart.items[i].total;
    }
    return total; // always in USD
  };

  // Is the item valid?
  $scope.itemValid = function (item) {
    // If the item has not loaded yet, fake as valid
    if (angular.isUndefined(item)) { return true; }

    // Amount is just *not there*
    if (angular.isUndefined(item.amount) || item.amount === null) { return false; }

    switch (item.type) {
      case ('Pledge'):
        // Reward amount minimum
        var reward;
        for (var i=0; i<item.fundraiser.rewards.length; i++) {
          reward = item.fundraiser.rewards[i];
          if (reward.id === item.reward_id && item.amount < reward.amount) {
            return false;
          }
        }
        return true;

      case ('Bounty'):
        switch (item.bounty_expiration) {
          case (3):
            if (item.amount < 250) { return false; }
            break;

          case (6):
            if (item.amount < 100) { return false; }
            break;
        }

      case ('TeamPayin'):
        return true;

      default:
        return false;
    }
  };

  // Are all of the items valid?
  $scope.itemsValid = function () {
    for (var i=0; $scope.cart && $scope.cart.items && i<$scope.cart.items.length; i++) {
      if (!$scope.itemValid($scope.cart.items[i])) {
        return false;
      }
    }
    return true;
  };

  // Can the cart be checked out?
  $scope.canCheckout = function () {
    // return angular.isDefined($scope.checkout_method) &&
    return $scope.checkoutPayload.checkout_method && $scope.itemsValid();
  };

  $scope.checkout = function () {
    var deferred = $q.defer();

    $scope.$watch('current_person', function (person) {
      if (angular.isObject(person)) {
        var checkoutMethod = $scope.checkoutPayload.checkout_method;
        $scope.cart.checkout(checkoutMethod).$promise.then(function (response) {
          // Redirect to PayPal checkout page
          if (checkoutMethod === 'paypal') {
            deferred.resolve();
            $window.location = response.checkout_url;

          // Show Google Wallet checkout modal
          } else if (checkoutMethod === 'google') {
            // a JWT is returned, trigger Google Wallet buy
            $window.google.payments.inapp.buy({
              jwt: response.jwt,

              success: function(result) {
                deferred.resolve();
                var query = $api.toKeyValue({
                  access_token: $api.get_access_token(),
                  order_id: result.response.orderId
                });
                deferred.resolve(true);
                $window.location = $rootScope.api_host + "payments/google/success?" + query;
              },

              failure: function() {
                deferred.reject(response);
              }
            });

          // Redirect to Coinbase checkout page
          } else if (checkoutMethod === 'coinbase') {
            deferred.resolve();
            $window.location = response.checkout_url;

          // Team or Person account, redirect to receipt page!
          } else {
            deferred.resolve();
            $window.location = response.receipt_url;
          }
        });
      } else if (person === false) {
        $api.set_post_auth_url($location.path(), $scope.checkoutPayload);
        $location.url('/signin');
      }
    });

    return deferred.promise;
  };

});
