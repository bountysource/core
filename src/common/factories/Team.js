'use strict';

angular.module('factories').factory('Team', function ($rootScope, $resource, $api) {

  var defaultHeaders = { 'Accept': 'application/vnd.bountysource+json; version=2' };

  var Team = $resource($rootScope.api_host + 'teams/:slug/:action', { slug: '@slug' }, {
    get: { method: 'GET', headers: defaultHeaders },
    query: { method: 'GET', headers: defaultHeaders, isArray: true },
    update: { method: 'PATCH', headers: defaultHeaders }
  });

  /**
   * Does this team have the RFP feature enabled?
   * */
  Team.prototype.rfpEnabled = function () {
    return !!this.rfp_enabled;
  };

  return Team;

});