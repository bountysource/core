'use strict';

angular.module('resources').factory('Bounties', function ($rootScope, $resource) {

  return $resource($rootScope.api_host + '/bounties', null, {
    get: {
      method: 'GET',
      isArray: true,
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' }
    }
  });

});
