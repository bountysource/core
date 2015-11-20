angular.module('resources').factory('ShoppingCartItems', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'cart_items', {}, {
    create: { method: 'POST', headers: $api.v2_headers() }
  });

});