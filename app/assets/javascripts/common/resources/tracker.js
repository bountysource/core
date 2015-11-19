angular.module('resources').factory('Tracker', function ($rootScope, $resource, $api) {

  var Tracker = $resource($rootScope.api_host + 'trackers/:id', { id: '@id' }, {
    get: { method: 'GET', headers: $api.v2_headers() },
    query: { method: 'GET', isArray: true, headers: $api.v2_headers() }
  });

  return Tracker;

});
