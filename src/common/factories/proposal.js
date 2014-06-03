'use strict';

angular.module('factories').factory('Proposal', function ($rootScope, $resource, $api) {

  var defaultHeaders = { Accept: 'application/vnd.bountysource+json; version=2' };
  var accessToken = $api.get_access_token();

  return $resource($rootScope.api_host + 'issues/:issue_id/proposals/:id/:action', { issue_id: '@issue_id', access_token: accessToken }, {
    query: { method: 'GET', isArray: true, headers: defaultHeaders },
    save: { method: 'POST', headers: defaultHeaders }
  });

});