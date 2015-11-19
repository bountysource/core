'use strict';

angular.module('resources').factory('Timeline', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'timeline', {}, {
    query: { method: 'GET', isArray: true, headers: $api.v2_headers() }
  });

});
