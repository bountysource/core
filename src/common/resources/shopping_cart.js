'use strict';

angular.module('resources').factory('ShoppingCart', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'cart', { access_token: $api.get_access_token() }, {
    get: {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

});