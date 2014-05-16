'use strict';

angular.module('factories').factory('TeamBadgeRaised', function ($rootScope, $window, $api, TeamBadge) {

  var TeamBadgeRaised = function () {
    this.type = 'raised';
    this.utmCampaignName = 'TEAM_BADGE_2';
    this.description = 'Total money raised by the team (from bounties, donations, and fundraisers)';
    TeamBadge.apply(this, arguments);
  };

  TeamBadge.prototype.imageUrl = function () {
    return $rootScope.api_host + 'badge/team?' + $api.toKeyValue({ id: this.team.id, type: this.type });
  };

  TeamBadgeRaised.prototype = new TeamBadge();

  return TeamBadgeRaised;

});