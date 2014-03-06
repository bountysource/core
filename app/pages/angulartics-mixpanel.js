'use strict';

angular.module('angulartics.mixpanel', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {
    angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
      $analyticsProvider.registerPageTrack(function (path) {
        mixpanel.track( "Page Viewed", { "page": path } );
      });
    });

    angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
      $analyticsProvider.registerEventTrack(function (action, properties) {
        mixpanel.track(action, properties);
      });
    });
  }]);

/*
* Fire Mixpanel events based on route
* */
angular.module('app')
  .run(function($rootScope, $location, $analytics) {

    $rootScope.$on('$routeChangeSuccess', function(routeChangeEvent, currentRoute) {
      var path = $location.path();

      /*
       * Issue show page views
       * */
      if (/^\/issues.+/.test(path)) {
        $analytics.eventTrack('Issue View', {
          id: currentRoute.params.id
        });
      }

      /*
      * Fundraiser show page views
      * */
      if (/^\/fundraisers.+/.test(path)) {
        $analytics.eventTrack('Fundraiser View', {
          id: currentRoute.params.id
        });
      }

      /*
      * Tracker show page view
      * */
      if (/^\/trackers.+/.test(path)) {
        $analytics.eventTrack('Tracker View', {
          id: currentRoute.params.id
        });
      }

    });

  });
