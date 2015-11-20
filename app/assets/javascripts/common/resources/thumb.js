angular.module('factories').factory('Thumb', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'thumbs/:id/:action', { id: '@id' }, {
    query: { method: 'GET', headers: $api.v2_headers(), isArray: true },
    create: { method: 'POST', headers: $api.v2_headers() }
  });

});
