'use strict';

angular.module('app').controller('ShoppingCartController', function($scope, $api, ShoppingCart) {

  // Load shopping cart
  $scope.cart = ShoppingCart.get();

  // Load the current person's teams
  $api.person_teams_get().then(function (teams) {
    $scope.teams = angular.copy(teams);
  });

  $scope.checkoutMethod = undefined;

  $scope.isPledge = function (item) {
    return angular.isObject(item) && item.type === 'Pledge';
  };

  $scope.isBounty = function (item) {
    return angular.isObject(item) && item.type === 'Pledge';
  };

  $scope.isTeamPayin = function (item) {
    return angular.isObject(item) && item.type === 'TeamPayin';
  };

});
