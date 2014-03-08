'use strict';

angular.module('angulartics.mixpanel', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {
    window.angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
      $analyticsProvider.registerEventTrack(function (action, properties) {
        mixpanel.track(action, properties);
      });
    });
  }]);

angular.module('app').service('mixpanelEvent', function($location, $analytics) {

  /*
   * Wrapper for analytics.eventTrack that adds in "page"
   * */
  this.track = function(event_name, options) {
    var payload = angular.extend({ page: $location.path() }, options||{});
    $analytics.eventTrack(event_name, payload);
  };

  this.bountyStart = function(options) {
    this.track('Start Bounty', angular.extend({ type: '$direct' }, options||{}));
  };

  /*
   * Start the Pledge placement process.
   * */
  this.pledgeStart = function(options) {
    this.track('Start Pledge', angular.extend({ type: '$direct' }, options||{}));
  };

});

/*
* Fire Mixpanel events based on route
* */
angular.module('app')
  .run(function($rootScope, $location, mixpanelEvent) {

    $rootScope.$on('$routeChangeSuccess', function(routeChangeEvent, currentRoute) {
      if (!currentRoute.$$route) {
        mixpanelEvent.track(($location.path() === '/legacy' ? 'View Legacy' : 'View Not Found'), currentRoute.params);
      } else if (currentRoute.$$route.trackEvent !== false) {
        mixpanelEvent.track(currentRoute.$$route.trackEvent || 'View Other', currentRoute.params);
      }
    });

  });
