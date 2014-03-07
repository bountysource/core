'use strict';

angular.module('angulartics.mixpanel', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {
    angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
      $analyticsProvider.registerEventTrack(function (action, properties) {
        mixpanel.track(action, properties);
      });
    });
  }]);

angular.module('app').service('mixpanelEvent', function($location, $analytics) {

  /*
  * Generic page view. Sends path and any search params from $location
  * */
  this.pageView = function(options) {
    options = options || {};
    var payload = this._buildPayload(options);
    $analytics.eventTrack('Page View', payload);
  };

  /*
   * Track Issue view
   * */
  this.issueView = function(id, options) {
    options = options || {};
    var payload = this._buildPayload(angular.extend({ id: this._unparameterizeId(id) }, options));
    $analytics.eventTrack('Issue View', payload);
  };

  /*
   * Track Fundraiser view
   * */
  this.fundraiserView = function(id, options) {
    options = options || {};
    var payload = this._buildPayload(angular.extend({ id: this._unparameterizeId(id) }, options));
    $analytics.eventTrack('Fundraiser View', payload);
  };

  /*
   * Track Fundraiser pledge page view
   * */
  this.pledgeView = function(id, options) {
    options = options || {};
    var payload = this._buildPayload(angular.extend({ id: this._unparameterizeId(id) }, options));
    $analytics.eventTrack('Pledge View', payload);
  };

  /*
  * Track Tracker view
  * */
  this.trackerView = function(id, options) {
    options = options || {};
    var payload = this._buildPayload(angular.extend({ id: this._unparameterizeId(id) }, options));
    $analytics.eventTrack('Tracker View', payload);
  };

  /*
   * Start the Bounty placement process.
   * */
  this.bountyStart = function(options) {
    options = options || {};
    var payload = this._buildPayload(angular.extend({ type: '$direct' }, options));
    $analytics.eventTrack('Bounty Start', payload);
  };

  /*
   * Start the Pledge placement process.
   * */
  this.pledgeStart = function(options) {
    options = options || {};
    var payload = this._buildPayload(angular.extend({ type: '$direct' }, options));
    $analytics.eventTrack('Pledge Start', payload);
  };

  /*
  * Build payload to send to Mixpanel.
  * Adds page param to all events with the current path.
  * */
  this._buildPayload = function(options) {
    options = options || {};
    var payload = angular.extend({ page: $location.path() }, options);
    return payload;
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
      var path = $location.path();

      /*
       * Issue View
       * */
      if (/^\/issues\/[^\/]+$/.test(path)) {
        mixpanelEvent.issueView(currentRoute.params.id);
      }

      /*
      * Fundraiser View
      * */
      else if (/^\/fundraisers\/[^\/]+$/.test(path)) {
        mixpanelEvent.fundraiserView(currentRoute.params.id);
      }

      /*
      * Fundraiser Pledge View
      * */
      else if (/^\/fundraisers\/[^\/]+\/pledge$/.test(path)) {
        mixpanelEvent.pledgeView(currentRoute.params.id);
      }

      /*
      * Tracker View
      * */
      else if (/^\/trackers\/[^\/]+$/.test(path)) {
        mixpanelEvent.trackerView(currentRoute.params.id);
      }

      /*
      * Page View
      * This is the catch-all event if the path does not have its own view event.
      * */
      else {
        mixpanelEvent.pageView();
      }

    });

  });
