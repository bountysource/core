angular.module('factories').factory('Solution', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'solutions/:id/:action', { id: '@id' }, {
    query: { method: 'GET', headers: $api.v2_headers(), isArray: true }
  });

});