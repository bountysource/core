'use strict';

angular.module('factories').factory('TeamBadgeBountiesReceived', function (TeamBadge) {

  var TeamBadgeBountiesReceived = function () {
    this.type = 'bounties_received';
    this.utmCampaignName = 'TEAM_BADGE_1';
    this.description = 'Bounties on projects owned by your team';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeBountiesReceived.prototype = new TeamBadge();

  return TeamBadgeBountiesReceived;

});