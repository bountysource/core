'use strict';

angular.module('app').controller('CartController', function($scope, $cart) {
  $cart.load().then(function(cart) {
    console.log(cart);

    $scope.cart = cart;
  });

//  $scope.cart = $api.get_cart().then(function(cart) {
//    console.log(cart);
//
//    for (var i=0; i<cart.items.length; i++) {
//      cart.items[i].$changes = {};
//    }
//
//    return cart;
//  });

  $scope.toggle_edit_mode = function(item) {
    item.$edit_mode = !item.$edit_mode;
  };

  $scope.remove_item = function(item) {};

  $scope.update_item = function(item) {};

  $scope.cancel_item_changes = function(item) {};
});
