'use strict';

angular.module('resources').factory('ShoppingCartItem', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'cart_items/:index', { access_token: $api.get_access_token() }, {
    update: {
      method: 'PATCH',
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    },

    delete: {
      method: 'DELETE',
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

});