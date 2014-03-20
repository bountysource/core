'use strict';

// mixpanel snippet minus the part that injects a script tag since we're hosting that now
/* jshint ignore:start */
(function(c,a){window.mixpanel=a;var b,d,h,e;a._i=[];a.init=function(b,c,f){function d(a,b){
var c=b.split(".");2==c.length&&(a=a[c[0]],b=c[1]);a[b]=function(){a.push([b].concat(
Array.prototype.slice.call(arguments,0)))}}var g=a;"undefined"!==typeof f?g=a[f]=[]:
f="mixpanel";g.people=g.people||[];h=['disable','track','track_pageview','track_links',
'track_forms','register','register_once','unregister','identify','alias','name_tag','set_config',
'people.set','people.set_once','people.increment','people.track_charge','people.append'];
for(e=0;e<h.length;e++)d(g,h[e]);a._i.push([b,c,f])};a.__SV=1.2;})(document,window.mixpanel||[]);
mixpanel.init(window.BS_CONFIG.mixpanel);
/* jshint ignore:end */


angular.module('app').service('$analytics', function($location, $log, $window) {
  this._debug = false;

  this.mixpanel = $window.mixpanel;

  this.mixpanel_distinct_id = function() {
    return $window.mixpanel.get_property('distinct_id');
  };

  // Wrapper for analytics.eventTrack that adds in "page"
  this.track = function(event_name, options) {
    var payload = angular.extend({ page: $location.path() }, options||{});

    if (this._debug) {
      $log.info('--- $analytics ---');
      $log.info('name:', event_name);
      $log.info('payload:', payload);
      $log.info('---------------------');

    } else {
      $window.mixpanel.track(event_name, payload);
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

  // User interacts with something to start a BountyClaim.
  // If no `type` is set on `options`, defaults to `$direct`
  this.startBountyClaim = function(issue_id, options) {
    this.track('Start Bounty Claim', angular.extend({ issue_id: issue_id, type: '$direct' }, options||{}));
  };

  // User submits a BountyClaim
  this.submitBountyClaim = function(issue_id, options) {
    this.track('Submit Bounty Claim', angular.extend({ issue_id: issue_id }, options||{}));
  };

  // Backer votes to accept BountyClaim
  this.voteAcceptBountyClaim = function(bounty_claim_id, issue_id, options) {
    this.track('Vote Accept Bounty Claim', angular.extend({ bounty_claim_id: bounty_claim_id, issue_id: issue_id }, options||{}));
  };

  // Backer votes to reject BountyClaim
  this.voteRejectBountyClaim = function(bounty_claim_id, issue_id, options) {
    this.track('Vote Reject Bounty Claim', angular.extend({ bounty_claim_id: bounty_claim_id, issue_id: issue_id }, options||{}));
  };

});

/*
* Fire Mixpanel events based on route
* */
angular.module('app')
  .run(function($rootScope, $location, $analytics) {
    $rootScope.$on('$routeChangeSuccess', function(routeChangeEvent, currentRoute) {
      if (!currentRoute.$$route) {
        $analytics.track(($location.path() === '/legacy' ? 'View Legacy' : 'View Not Found'), currentRoute.params);
      } else if ((currentRoute.$$route.trackEvent !== false) && (!currentRoute.$$route.redirectTo)) {
        $analytics.track(currentRoute.$$route.trackEvent || 'View Other', currentRoute.params);
      }
    });
  });
