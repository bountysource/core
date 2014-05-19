'use strict';

angular.module('factories').factory('TeamBadgeBountiesPosted', function ($window, TeamBadge) {

  var TeamBadgeBountiesPosted = function () {
    this.type = 'bounties_posted';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeBountiesPosted.prototype = new TeamBadge();

  TeamBadgeBountiesPosted.prototype.baseFrontendUrl = function () {
    return $window.location.protocol + '//' + $window.location.host + '/teams/' + this.team.slug + '/bounties';
  };

  TeamBadgeBountiesPosted.prototype.description = function () {
    return 'Bounties posted on behalf of ' + this.team.name;
  };

  return TeamBadgeBountiesPosted;

});