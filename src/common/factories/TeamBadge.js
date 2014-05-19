'use strict';

angular.module('factories').factory('TeamBadge', function ($rootScope, $window, $api, Badge) {

  var TeamBadge = function (team) {
    this.team = angular.copy(team);
  };

  TeamBadge.prototype = new Badge();

  TeamBadge.prototype.baseFrontendUrl = function () {
    return $window.location.protocol + '//' + $window.location.host + '/teams/' + this.team.slug;
  };

  TeamBadge.prototype.imageUrl = function () {
    return $rootScope.api_host + 'badge/team?' + $api.toKeyValue({ team_id: this.team.id, style: this.type });
  };

  TeamBadge.prototype.utmParams = function () {
    return { utm_source: this.team.name, utm_medium: 'shield', utm_campaign: this.type };
  };

  return TeamBadge;

});