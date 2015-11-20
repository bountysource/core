angular.module('resources').factory('ShoppingCartItem', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'cart_items/:index', {}, {
    update: { method: 'PATCH', headers: $api.v2_headers() },
    delete: { method: 'DELETE', headers: $api.v2_headers() }
  });

});