'use strict';

angular.module('angulartics.mixpanel', ['angulartics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {
    window.angulartics.waitForVendorApi('mixpanel', 500, function (mixpanel) {
      $analyticsProvider.registerEventTrack(function (action, properties) {
        mixpanel.track(action, properties);
      });
    });
  }]);

angular.module('app').service('mixpanelEvent', function($location, $analytics, $log) {

  this._debug = false;

  // Wrapper for analytics.eventTrack that adds in "page"
  this.track = function(event_name, options) {
    var payload = angular.extend({ page: $location.path() }, options||{});

    if (this._debug) {
      $log.info('--- mixpanelEvent ---');
      $log.info('name:', event_name);
      $log.info('options:', options);
      $log.info('payload:', payload);
      $log.info('---------------------');

    } else {
      $analytics.eventTrack(event_name, payload);
    }
  };

  // Start the Bounty posting process.
  this.bountyStart = function(options) {
    this.track('Start Bounty', angular.extend({ type: '$direct' }, options||{}));
  };

  // Start the Pledge placement process.
  this.pledgeStart = function(options) {
    this.track('Start Pledge', angular.extend({ type: '$direct' }, options||{}));
  };

  // Show the Solution start form
  this.startSolutionCreate = function(issue_id, options) {
    this.track('Start Solution Create', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // Hide the Solution start form
  this.hideSolutionCreate = function(issue_id, options) {
    this.track('Hide Solution Create', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // Submit the Solution form
  this.submitSolutionCreate = function(issue_id, options) {
    this.track('Submit Solution Create', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // Show the Solution edit form
  this.startSolutionEdit = function(issue_id, options) {
    this.track('Start Solution Edit', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // Show the Solution edit form
  this.hideSolutionEdit = function(issue_id, options) {
    this.track('Hide Solution Edit', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // Submit changes on the Solution edit form
  this.submitSolutionEdit = function(issue_id, options) {
    this.track('Submit Solution Edit', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // Prompt is shown to confirm delete of Solution
  this.deleteSolutionPrompt = function(issue_id, options) {
    this.track('Stop Solution Prompt', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // User confirmed that they want to delete their Solution
  this.deleteSolutionConfirm = function(issue_id, options) {
    this.track('Stop Solution Confirm', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // User cancelled out of deleting their solution
  this.deleteSolutionClose = function(issue_id, options) {
    this.track('Stop Solution Confirm', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // User declares that they are still actively working on their Solution
  this.checkinSolution = function(issue_id, options) {
    this.track('Checkin Solution', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // User declares that they havefinished their Solution
  this.completeSolution = function(issue_id, options) {
    this.track('Complete Solution', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // User sets a bounty goal on an Issue
  this.setBountyGoal = function(amount, issue_id, options) {
    this.track('Set Bounty Goal', angular.extend({ amount: amount, issue_id: issue_id }, options||{}));
  };

  // User changes their bounty goal on an Issue
  this.updateBountyGoal = function(new_amount, issue_id, options) {
    this.track('Update Bounty Goal', angular.extend({ amount: new_amount, issue_id: issue_id }, options||{}));
  };

  // User removes their bounty goal on an Issue
  this.removeBountyGoal = function(issue_id, options) {
    this.track('Remove Bounty Goal', angular.extend({ issue_id: issue_id }, options||{}));
  };
  
  this.signIn = function (options) {
    this.track("Sign-In", angular.extend({ type: '$direct' }, options||{}));
  };

  this.signUp = function (options) {
    this.track("Sign-Up", angular.extend({ type: '$direct' }, options||{}));
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
