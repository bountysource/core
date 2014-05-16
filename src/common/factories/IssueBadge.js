'use strict';

angular.module('factories').factory('IssueBadge', function (Badge) {

  var IssueBadge = function (issue) {
    this.issue = angular.copy(issue);
    Badge.apply(this, arguments);
  };

  IssueBadge.prototype = new Badge();

  IssueBadge.prototype.baseFrontendUrl = function () {
    return $window.location.protocol + '//' + $window.location.host + '/issues/' + this.issue.slug;
  };

  IssueBadge.prototype.imageUrl = function () {
    return $rootScope.api_host + 'badge/issue?' + $api.toKeyValye({ id: this.team.id });
  };

  IssueBadge.prototype.utmParams = function () {
    return { utm_source: this.issue.id, utm_medium: 'shield', utm_campaign: 'ISSUE_BADGE' };
  };

  return IssueBadge;

});