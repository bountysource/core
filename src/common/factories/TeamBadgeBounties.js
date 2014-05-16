'use strict';

angular.module('factories').factory('TeamBadgeBounties', function (TeamBadge) {

  var TeamBadgeBounties = function () {
    this.type = 'bounties';
    this.utmCampaignName = 'TEAM_BADGE_1';
    this.description = 'Bounties posted by members of your team';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeBounties.prototype = new TeamBadge();

  return TeamBadgeBounties;

});