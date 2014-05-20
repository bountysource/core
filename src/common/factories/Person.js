'use strcit';

angular.module('factories').factory('Person', function ($rootScope, Team) {

  var defaultHeaders = { 'Accept': 'application/vnd.bountysource+json; version=2' };

  var Person = $resource($rootScope.api_host + 'people/:id/:action', { id: '@id' }, {
    get: { method: 'GET', headers: defaultHeaders }
  });

  /*
  * Can the Person create an RFP on the issue?
  * */
  Person.prototype.canCreateRfp = function (issue) {
    // Load Person's teams.
    Team.query({ person_id: this.id }, function (teams) {
      debugger;
    });
  };

  return Person;

})