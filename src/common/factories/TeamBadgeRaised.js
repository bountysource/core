'use strict';

angular.module('factories').factory('TeamBadgeRaised', function ($rootScope, $window, $api, TeamBadge) {

  var TeamBadgeRaised = function () {
    this.type = 'raised';
    this.utmCampaignName = 'TEAM_BADGE_2';
    this.description = 'Total money raised by the team (from bounties, donations, and fundraisers)';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeRaised.prototype = new TeamBadge();

  return TeamBadgeRaised;

});