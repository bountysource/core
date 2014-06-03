'use strict';

angular.module('factories').factory('RequestForProposal', function ($rootScope, $resource, $api) {

  var defaultHeaders = { Accept: 'application/vnd.bountysource+json; version=2' };
  var accessToken = $api.get_access_token();

  var RequestForProposal = $resource($rootScope.api_host + 'issues/:issue_id/request_for_proposals/:id', { issue_id: '@issue_id', id: '@id', access_token: accessToken }, {
    get:  { method: 'GET', headers: defaultHeaders },
    save: { method: 'POST', headers: defaultHeaders }
  });

  /**
   * Is this a saved record?
   *
   * TODO move this to a prototype method on our own resource factory.
   * TODO TODO create our own own resource factory.
   *
   * @return {boolean} is the record saved
   * */
  RequestForProposal.prototype.saved = function () {
    return !!this.id;
  };

  return RequestForProposal;
});
