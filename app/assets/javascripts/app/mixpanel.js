'use strict';

// mixpanel snippet minus the part that injects a script tag since we're hosting that now
/* jshint ignore:start */
(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
mixpanel.init(window.BS_ENV.mixpanel, window.BS_ENV.mixpanel_config);
/* jshint ignore:end */


angular.module('app').service('$analytics', function($location, $log, $window, $timeout) {
  this._debug = false;

  this.mixpanel = $window.mixpanel;

  this.reset_mixpanel_distinct_id = function() {
    // copied from mixpanel.js because it's not exported
    /* jshint ignore:start */
    var UUID = (function(){var T=function(){var d=1*new Date(),i=0;while(d==1*new Date()){i++}return d.toString(16)+i.toString(16)};var R=function(){return Math.random().toString(16).replace('.','')};var UA=function(n){var ua=navigator.userAgent,i,ch,buffer=[],ret=0;function xor(result,byte_array){var j,tmp=0;for(j=0;j<byte_array.length;j++){tmp|=(buffer[j]<<j*8)}return result^tmp}for(i=0;i<ua.length;i++){ch=ua.charCodeAt(i);buffer.unshift(ch&0xFF);if(buffer.length>=4){ret=xor(ret,buffer);buffer=[]}}if(buffer.length>0){ret=xor(ret,buffer)}return ret.toString(16)};return function(){var se=(screen.height*screen.width).toString(16);return(T()+"-"+R()+"-"+UA()+"-"+se+"-"+T())}})();
    /* jshint ignore:end */

    $window.mixpanel.identify(UUID());
  };

  this.mixpanel_distinct_id = function() {
    return $window.mixpanel.get_property ? $window.mixpanel.get_property('distinct_id') : null;
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
      $timeout(function() {
        $window.mixpanel.track(event_name, payload);
      }, 0);
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

  this.teamPayinStart = function (options) {
    this.track('Start Team Payin', angular.extend({ type: '$direct'}, options || {} ));
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

  // Fundraiser start draft -- Types are the referrer 'type'
  // 1. Finish making new team and come to fundraiser_new form in team page
  // 2. Select pre-existing team on '/fundraisers/new'
  // 3. Click button on "Manage Fundraisers" page
  // 4. Click 'Create Fundraiser' on admin dropdown on team page
  this.startFundraiserDraft = function (team_id, options) {
    this.track("Start Fundraiser Draft", angular.extend( {team_id: team_id}, options || {}));
  };

  this.createFundraiser = function (team_id, options) {
    this.track("Create Fundraiser", angular.extend( {team_id: team_id}, options || {}));
  };

  this.publishFundraiser = function (team_id, fundraiser_id, options) {
    this.track("Publish Fundraiser", angular.extend( {team_id: team_id, fundraiser_id: fundraiser_id}, options || {}));
  };

  this.changeCurrency = function (value, options) {
    this.track("Change Currency", angular.extend({ value: value }, options || {}));
  };

  // Plugin Tracking - Plugin Start Install, Plugin Finish Install
  this.startPluginInstall = function (options) {
    this.track("Plugin Start Install", options || {});
  };

  this.completePluginInstall = function (options) {
    this.track("Plugin Complete Install", options || {});
  };

});

/*
* Fire Mixpanel events based on route
* */
angular.module('app')
  .run(function($rootScope, $location, $analytics) {
    $rootScope.$on('$routeChangeSuccess', function(routeChangeEvent, currentRoute) {
      if (!currentRoute.$$route) {
        $analytics.track('View Not Found', currentRoute.params);
      } else if ((currentRoute.$$route.trackEvent !== false) && (!currentRoute.$$route.redirectTo)) {
        $analytics.track(currentRoute.$$route.trackEvent || 'View Other', currentRoute.params);
      }
    });
  });
