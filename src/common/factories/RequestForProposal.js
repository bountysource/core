'use strict';

angular.module('factories').factory('RequestForProposal', function ($rootScope, $resource, $api) {

  var defaultHeaders = { Accept: 'application/vnd.bountysource+json; version=2' };
  var accessToken = $api.get_access_token();

  var RequestForProposal = $resource($rootScope.api_host + 'issues/:issue_id/request_for_proposals', { issue_id: '@issue_id', access_token: accessToken }, {
    get:  { method: 'GET', headers: defaultHeaders },
    save: { method: 'POST', headers: defaultHeaders }
  });

  return RequestForProposal;
});
