angular.module('resources').factory('Tag', function ($rootScope, $resource, $api) {

  var Tag = $resource($rootScope.api_host + 'tags/:id', { id: '@id' }, {
    query: { method: 'GET', isArray: true, headers: $api.v2_headers() },
    create: { method: 'POST', isArray: true, headers: $api.v2_headers() }
  });

  return Tag;

});
