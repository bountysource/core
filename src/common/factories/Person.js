'use strict';

angular.module('factories').factory('Person', function ($rootScope, $resource) {

  var defaultHeaders = { 'Accept': 'application/vnd.bountysource+json; version=2' };

  var Person = $resource($rootScope.api_host + 'people/:id/:action', { id: '@id' }, {
    get: { method: 'GET', headers: defaultHeaders }
  });

  /*
  * Can the Person create an RFP on the issue?
  * */
  Person.prototype.canCreateRfp = function (issue) {

    // TODO check permission:
    // 1. Team has RFP enabled
    // 2. Person is a member of the team
    // 3. [Person is an admin of the team ?]

    return true;

  };

  return Person;

});