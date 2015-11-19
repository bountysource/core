angular.module('resources').factory('Stat', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'stats/:id', { id: '@id' }, {
    query: { method: 'GET', isArray: true, headers: $api.v2_headers() }
  });

});
