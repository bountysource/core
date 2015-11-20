angular.module('factories').factory('DeveloperGoal', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'developer_goals/:id/:action', { id: '@id' }, {
    query: { method: 'GET', headers: $api.v2_headers(), isArray: true },
    create: { method: 'POST', headers: $api.v2_headers() }
  });

});