'use strict';

angular.module('resources').factory('Comments', function ($rootScope, $resource) {

  return $resource($rootScope.api_host + '/comments', null, {
    index: {
      method: 'GET',
      isArray: true,
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

});
