angular.module('factories').factory('IssueBadge', function ($rootScope, $window, $api, Badge) {

  var IssueBadge = function (issue) {
    this.issue = issue;
    this.description = 'Total bounty on this issue';
    Badge.apply(this, arguments);
  };

  IssueBadge.prototype = new Badge();

  IssueBadge.prototype.baseFrontendUrl = function () {
    return window.BS_ENV.www_host + 'issues/' + this.issue.slug;
  };

  IssueBadge.prototype.imageUrl = function () {
    return window.BS_ENV.api_host + 'badge/issue?' + $api.toKeyValue({ issue_id: this.issue.id });
  };

  IssueBadge.prototype.utmParams = function () {
    return { utm_source: this.issue.id, utm_medium: 'shield', utm_campaign: 'ISSUE_BADGE' };
  };

  return IssueBadge;

});
