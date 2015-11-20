angular.module('factories').factory('Person', function ($rootScope, $resource, $api) {

  var Person = $resource($rootScope.api_host + 'people/:id/:action', { id: '@id' }, {
    get: { method: 'GET', headers: $api.v2_headers() },
    update: { method: 'PATCH', headers: $api.v2_headers() }
  });

  return Person;

});
