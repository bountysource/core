'use strict';

angular.module('resources').factory('ShoppingCartItems', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'cart_items', { access_token: $api.get_access_token() }, {
    create: {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

});