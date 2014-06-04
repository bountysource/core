'use strict';

angular.module('factories').factory('Proposal', function ($rootScope, $resource, $api) {

  var defaultHeaders = { Accept: 'application/vnd.bountysource+json; version=2' };
  var accessToken = $api.get_access_token();

  var Proposal = $resource($rootScope.api_host + 'issues/:issue_id/proposals/:id/:action', { issue_id: '@issue_id', access_token: accessToken }, {
    query: { method: 'GET', isArray: true, headers: defaultHeaders },
    save: { method: 'POST', headers: defaultHeaders },
    delete: { method: 'DELETE', headers: defaultHeaders }
  });

  /**
   * Is this a saved record?
   *
   * TODO move this to a prototype method on our own resource factory.
   * TODO TODO create our own own resource factory.
   *
   * @return {boolean} is the record saved
   * */
  Proposal.prototype.saved = function () {
    return !!this.id;
  };

  return Proposal;

});
