'use strict';

angular.module('factories').factory('TeamBadgeRaised', function ($rootScope, $window, $api, TeamBadge) {

  var TeamBadgeRaised = function () {
    this.type = 'raised';
    TeamBadge.apply(this, arguments);
  };

  TeamBadgeRaised.prototype = new TeamBadge();

  TeamBadgeRaised.prototype.description = function () {
    return 'Total funds raised by ' + this.team.name + ' (from bounties, donations, and fundraisers)';
  };

  return TeamBadgeRaised;

});