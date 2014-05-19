'use strict';

angular.module('factories').factory('TeamBadgeBountiesPosted', function (TeamBadge) {

  var TeamBadgeBountiesPosted = function () {
    this.type = 'bounties_posted';
    this.utmCampaignName = 'TEAM_BADGE_1';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeBountiesPosted.prototype = new TeamBadge();

  TeamBadgeBountiesPosted.prototype.description = function () {
    return 'Bounties posted on behalf of ' + this.team.name;
  };

  return TeamBadgeBountiesPosted;

});