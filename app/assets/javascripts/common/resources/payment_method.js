angular.module('factories').factory('PaymentMethod', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'payment_methods/:id/:action', { id: '@id' }, {
    query: { method: 'GET', headers: $api.v2_headers(), isArray: true }
  });

});
