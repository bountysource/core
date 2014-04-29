'use strict';

angular.module('resources').factory('Issue', function ($rootScope, $resource) {

  return $resource($rootScope.api_host + '/issues/:id', null, {
    get: {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    },

    index: {
      method: 'GET',
      isArray: true,
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

});
