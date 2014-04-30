'use strict';

angular.module('resources').factory('ShoppingCart', function ($rootScope, $resource, $api) {

  var ShoppingCart = $resource($rootScope.api_host + 'cart', { access_token: $api.get_access_token() }, {
    get: {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    },
    create: {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

  angular.extend(ShoppingCart, {
    claim: function () {
      return $resource($rootScope.api_host + 'cart/claim', null, {
        claim: {
          method: 'POST',
          headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
        }
      }).claim.apply(undefined, arguments);
    }
  });

  return ShoppingCart;

});