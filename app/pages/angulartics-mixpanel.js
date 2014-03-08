'use strict';

angular.module('angulartics.mixpanel', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {
    angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
      $analyticsProvider.registerEventTrack(function (action, properties) {
        mixpanel.track(action, properties);
      });
    });
  }]);

angular.module('app').service('mixpanelEvent', function($location, $analytics, $window) {

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

  /*
  * Turn a parameterized id into an integer
  * */
  this._unparameterizeId = function(parameterized_id) {
    var id = ((parameterized_id || '').match(/^(\d+)(?:\-[a-z0-9\-_]*)?/i) || [])[1];
    return $window.parseInt(id, 10);
  };

});

/*
* Fire Mixpanel events based on route
* */
angular.module('app')
  .run(function($rootScope, $location, mixpanelEvent) {

    $rootScope.$on('$routeChangeSuccess', function(routeChangeEvent, currentRoute) {
      if (currentRoute.$$route.trackEvent === false) {
        return;
      }

      var path = $location.path();
      mixpanelEvent.track(currentRoute.$$route.trackEvent || 'View Other', currentRoute.params);
    });

  });
