'use strict';

angular.module('factories').factory('TeamBadgeBountiesReceived', function (TeamBadge) {

  var TeamBadgeBountiesReceived = function () {
    this.type = 'bounties_received';
    this.utmCampaignName = 'TEAM_BADGE_1';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeBountiesReceived.prototype = new TeamBadge();

  TeamBadgeBountiesReceived.prototype.description = function () {
    return 'Bounties on projects owned by ' + this.team.name;
  };

  return TeamBadgeBountiesReceived;

});