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

  /**
   * Toggle the RFP feature for this team. Requires user to be a Bountysource admin
   * */
  Team.prototype.toggleRfpEnabled = function () {
    return this.$update({
      access_token: $api.get_access_token(),
      rfp_enabled: !this.rfpEnabled()
    });
  };

  return Team;

});