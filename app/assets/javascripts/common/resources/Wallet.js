angular.module('factories').factory('Wallet', function ($rootScope, $resource, $api) {

  var Wallet = $resource($rootScope.api_host + 'wallets/:id/:action', { id: '@id' }, {
    create: { method: 'POST', headers: $api.v2_headers() },
    get: { method: 'GET', headers: $api.v2_headers() },
    update: { method: 'PATCH', headers: $api.v2_headers() }
  });

  return Wallet;

});
