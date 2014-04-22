'use strict';

angular.module('resources').factory('Issues', function ($rootScope, $resource) {

  return $resource($rootScope.api_host + '/issues', null, {
    index: {
      method: 'GET',
      isArray: true,
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

});