angular.module('resources').factory('Recommendation', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'recommendations', {}, {
    query: { method: 'GET', isArray: true, headers: $api.v2_headers() },
    create: { method: 'POST', headers: $api.v2_headers() }
  });

});
