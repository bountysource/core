'use strict';

angular.module('angulartics.mixpanel', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {

//    Disabling global page tracking for now
//    angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
//      $analyticsProvider.registerPageTrack(function (path) {
//        mixpanel.track( "Page Viewed", { "page": path } );
//      });
//    });

    angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
      $analyticsProvider.registerEventTrack(function (action, properties) {
        mixpanel.track(action, properties);
      });
    });
  }]);

angular.module('app').service('mixpanelEvent', function($analytics) {

  /*
   * Track Issue view
   * */
  this.issueView = function(id, options) {
    options = options || {};
    var payload = angular.extend(options, { id: id });
    $analytics.eventTrack('Issue View', payload);
  };

  /*
   * Track Fundraiser view
   * */
  this.fundraiserView = function(id, options) {
    options = options || {};
    var payload = angular.extend(options, { id: id });
    $analytics.eventTrack('Fundraiser View', payload);
  };

  /*
  * Track Tracker view
  * */
  this.trackerView = function(id, options) {
    options = options || {};
    var payload = angular.extend(options, { id: id });
    $analytics.eventTrack('Tracker View', payload);
  }

  /*
   * Start the Bounty placement process.
   * */
  this.bountyStart = function(options) {
    options = options || {};
    var payload = angular.extend(options, { type: '$direct' });
    $analytics.eventTrack('Bounty Start', payload);
  };

  /*
   * Start the Pledge placement process.
   * */
  this.pledgeStart = function(options) {
    options = options || {};
    var payload = angular.extend(options, { type: '$direct' });
    $analytics.eventTrack('Pledge Start', payload);
  };

});


/*
* Fire Mixpanel events based on route
* */
angular.module('app')
  .run(function($rootScope, $location, mixpanelEvent) {

    $rootScope.$on('$routeChangeSuccess', function(routeChangeEvent, currentRoute) {
      var path = $location.path();

      /*
       * Issue show page views
       * */
      if (/^\/issues.+/.test(path)) {
        mixpanelEvent.issueView(currentRoute.params.id);
      }

      /*
      * Fundraiser show page views
      * */
      if (/^\/fundraisers.+/.test(path)) {
        mixpanelEvent.fundraiserView(currentRoute.params.id);
      }

      /*
      * Tracker show page view
      * */
      if (/^\/trackers.+/.test(path)) {
        mixpanelEvent.trackerView(currentRoute.params.id);
      }

    });

  });
