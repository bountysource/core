'use strict';

angular.module('factories').factory('Person', function ($rootScope, $resource) {

  var defaultHeaders = { 'Accept': 'application/vnd.bountysource+json; version=2' };

  var Person = $resource($rootScope.api_host + 'people/:id/:action', { id: '@id' }, {
    get: { method: 'GET', headers: defaultHeaders },
  });

  return Person;

});
