'use strict';

angular.module('app').controller('ShoppingCartController', function($scope, $window, $api, $cart, $log, ShoppingCart, ShoppingCartItem) {

  window.ShoppingCartItem = ShoppingCartItem;

  // Load shopping cart
  $scope.cart = ShoppingCart.get();

  $scope.$watch('cart', function (cart) {
    if (angular.isObject(cart)) {
      for (var i=0; $scope.cart.items && i<$scope.cart.items.length; i++) {
        // Stupid hack: item amounts to float
        $scope.cart.items[i].amount = $window.parseFloat($scope.cart.items[i].amount);

        // Initialize total
        $scope.cart.items[i].total = $scope.calculateItemTotal($scope.cart.items[i]);
      }
    }
  }, true);

  $scope.checkoutMethod = undefined;

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
    return ShoppingCartItem.update({ index: index }, payload);
  };

  $scope.removeItem = function (index) {
    if ($window.confirm('Are you for real?')) {
      ShoppingCartItem.delete({ index: index });
      $scope.cart.items.splice(index,1);
    }
  };

  $scope.checkout = function () {
    console.log('Checkout!');
  };

  $scope.setOwner = function (index, type, owner) {
    switch (type) {
      case ('anonymous'):
        $scope.cart.items[index].owner = {
          display_name: 'Anonymous',
          image_url: 'images/anon.jpg'
        };
        ShoppingCartItem.update({ index: index }, {
          owner_id: null,
          owner_type: null,
          anonymous: true
        });
        break;

      case ('person'):
        $scope.cart.items[index].owner = angular.copy(owner);
        ShoppingCartItem.update({ index: index }, {
          owner_id: owner.id,
          owner_type: 'Person',
          anonymous: false
        });
        break;

      case ('team'):
        $scope.cart.items[index].owner = angular.copy(owner);
        ShoppingCartItem.update({ index: index }, {
          owner_id: owner.id,
          owner_type: 'Team',
          anonymous: false
        });
        break;

      default:
        $log.error('Unexpected owner:', type, owner);
    }

    console.log(index, owner);

    // ShoppingCartItem.update({ index: index })
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

  $scope.calculateItemTotal = function (item) {
    var total = 0.0;
    switch (item.type) {
      case ('Pledge'):
        total += parseFloat(item.amount);
        break;

      case ('Bounty'):
        total += parseFloat(item.amount);

        if (item.tweet === true) {
          total += 20;
        }

        switch (item.bounty_expiration)

        break;

      case ('TeamPayin'):
        total += parseFloat(item.amount);
        break;
    }
    return total;
  };


  $scope.calculateCartTotal = function () {
    var total = 0.0;
    for (var i=0; $scope.cart.items && i<$scope.cart.items.length; i++) {
      total += $scope.cart.items[i].total;
    }
    return total;
  };

});
