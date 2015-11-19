'use strict';

angular.module('factories').factory('TeamBadgeBountiesReceived', function ($window, TeamBadge) {

  var TeamBadgeBountiesReceived = function () {
    this.type = 'bounties_received';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeBountiesReceived.prototype = new TeamBadge();

  TeamBadgeBountiesReceived.prototype.baseFrontendUrl = function () {
    return window.BS_ENV.www_host + 'teams/' + this.team.slug + '/issues';
  };

  TeamBadgeBountiesReceived.prototype.description = function () {
    return 'Bounties on projects owned by ' + this.team.name;
  };

  return TeamBadgeBountiesReceived;

});
