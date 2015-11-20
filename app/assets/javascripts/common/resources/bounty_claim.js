angular.module('factories').factory('BountyClaim', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'bounty_claims/:id/:action', { id: '@id' }, {
    query: { method: 'GET', headers: $api.v2_headers(), isArray: true }
  });

});