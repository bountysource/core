angular.module('resources').factory('ShoppingCart', function ($rootScope, $resource, $api) {

  var ShoppingCart = $resource($rootScope.api_host + 'cart', {}, {
    get: { method: 'GET', headers: $api.v2_headers() },
    create: { method: 'POST', headers: $api.v2_headers() }
  });

  angular.extend(ShoppingCart, {
    claim: function () {
      return $resource($rootScope.api_host + 'cart/claim', {}, {
        claim: { method: 'POST', headers: $api.v2_headers() }
      }).claim.apply(undefined, arguments);
    },

    checkout: function () {
      return $resource($rootScope.api_host + 'cart/checkout', {}, {
        claim: { method: 'GET', headers: $api.v2_headers() }
      }).claim.apply(undefined, arguments);
    }
  });

  return ShoppingCart;

});