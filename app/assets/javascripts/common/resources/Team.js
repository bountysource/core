angular.module('factories').factory('Team', function ($rootScope, $resource, $api) {

  var Team = $resource($rootScope.api_host + 'teams/:slug/:action', { slug: '@slug' }, {
    get: { method: 'GET', headers: $api.v2_headers() },
    query: { method: 'GET', headers: $api.v2_headers(), isArray: true },
    update: { method: 'PATCH', headers: $api.v2_headers() }
  });

  /**
   * Does this team have the RFP feature enabled?
   * */
  Team.prototype.rfpEnabled = function () {
    return !!this.rfp_enabled;
  };

  return Team;

});
