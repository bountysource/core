'use strict';

angular.module('factories').factory('Team', function ($rootScope) {

  var defaultHeaders = { 'Accept': 'application/vnd.bountysource+json; version=2' };

  var Team = $resource($rootScope.api_host + 'teams/:id/:action', { id: '@id' }, {
    get: { method: 'GET', headers: defaultHeaders },
    query: { method: 'GET', headers: defaultHeaders, isArray: true }
  });

  /*
  * Does this team have the RFP feature enabled?
  * */
  Team.prototype.rfpEnabled = function () {
    return !!this.rfp_enabled;
  };

  return Team;

});