'use strict';

/**
 * Possible states for a proposal:
 * - pending
 * - pending_appointment
 * - appointed
 * - pending_acceptance
 * - accepted
 * - rejected
 * */
angular.module('factories').factory('Proposal', function ($rootScope, $resource, $api) {

  var Proposal = $resource($rootScope.api_host + 'issues/:issue_id/proposals/:id/:action', { issue_id: '@issue_id', id: '@id' }, {
    mine: { method: 'GET', params: { id: 'mine' }, headers: $api.v2_headers() },
    show: { method: 'GET', headers: $api.v2_headers() },
    query: { method: 'GET', isArray: true, headers: $api.v2_headers() },
    save: { method: 'POST', headers: $api.v2_headers() },
    delete: { method: 'DELETE', params: { id: 'mine' }, headers: $api.v2_headers() },
    accept: { method: 'POST', params: { action: 'accept' }, headers: $api.v2_headers() },
    reject: { method: 'POST', params: { action: 'reject' }, headers: $api.v2_headers() }
  });

  /**
   * Is this a saved record?
   *
   * TODO move this to a prototype method on our own resource factory.
   * TODO TODO create our own resource factory.
   *
   * @return {boolean} is the record saved
   * */
  Proposal.prototype.saved = function () {
    return !!this.id;
  };

  Proposal.prototype.isPending = function () {
    return this.state === 'pending';
  };

  Proposal.prototype.isRejected = function () {
    return this.state === 'rejected';
  };

  Proposal.prototype.isPendingAppointment = function () {
    return this.state === 'pending_appointment';
  };

  Proposal.prototype.isAccepted = function() {
    return this.state === 'appointed';
  };

  Proposal.prototype.isPendingApproval = function () {
    return this.state === 'pending_approval';
  };

  Proposal.prototype.canBeRevoked = function () {
    return this.isPending() || this.isPendingAppointment() || this.isRejected();
  };

  return Proposal;

});
