angular.module('factories').factory('TrackerBadge', function ($rootScope, $window, $api, Badge) {

  var TrackerBadge = function (tracker) {
    this.tracker = angular.copy(tracker);
    this.description = 'Total bounty on this tracker';
    Badge.apply(this, arguments);
  };

  TrackerBadge.prototype = new Badge();

  TrackerBadge.prototype.baseFrontendUrl = function () {
    return window.BS_ENV.www_host + 'trackers/' + this.tracker.slug;
  };

  TrackerBadge.prototype.imageUrl = function () {
    return window.BS_ENV.api_host + 'badge/tracker?' + $api.toKeyValue({ tracker_id: this.tracker.id });
  };

  TrackerBadge.prototype.utmParams = function () {
    return { utm_source: this.tracker.id, utm_medium: 'shield', utm_campaign: 'TRACKER_BADGE' };
  };

  return TrackerBadge;

});
