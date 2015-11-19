angular.module('factories').factory('RequestForProposal', function ($rootScope, $resource, $api) {

  var RequestForProposal = $resource($rootScope.api_host + 'issues/:issue_id/request_for_proposals/:id', { issue_id: '@issue_id', id: '@id' }, {
    get:  { method: 'GET', headers: $api.v2_headers() },
    save: { method: 'POST', headers: $api.v2_headers() }
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

  /**
   * A Request for Proposal is blank if the all of the visible attributes are nil.
   *
   * @return {boolean} true if all visible attributes null
   * */
  RequestForProposal.prototype.blank = function () {
    return this.budget === null &&
      this.due_date === null &&
      this.notes === null;
  };

  RequestForProposal.prototype.pending = function () {
    return this.state === 'pending';
  };

  RequestForProposal.prototype.pendingFulfillment = function () {
    return this.state === 'pending_fulfillment';
  };

  RequestForProposal.prototype.fulfilled = function () {
    return this.state === 'fulfilled';
  };

  return RequestForProposal;
});
