'use strict';

angular.module('factories').factory('TeamBadgeBountiesPosted', function (TeamBadge) {

  var TeamBadgeBountiesPosted = function () {
    this.type = 'bounties_posted';
    this.utmCampaignName = 'TEAM_BADGE_1';
    this.description = 'Bounties posted by members of your team';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeBountiesPosted.prototype = new TeamBadge();

  return TeamBadgeBountiesPosted;

});