angular.module('factories').factory('Report', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'reports/:id', { id: '@id' }, {
    query: { method: 'GET', headers: $api.v2_headers(), isArray: true },
    get: { method: 'GET', headers: $api.v2_headers() },
    create: { method: 'POST', headers: $api.v2_headers() },
    update: { method: 'PATCH', headers: $api.v2_headers() }
  });

});
