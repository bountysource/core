angular.module('resources').factory('Issue', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'issues/:id/:action', { id: '@id' }, {
    get: { method: 'GET', headers: $api.v2_headers() },
    query: { method: 'GET', isArray: true, headers: $api.v2_headers() },
    save: { method: 'POST', headers: $api.v2_headers() }
  });

});
