'use strict';

angular.module('app')
  .service('$analytics', function($location, $log, $window) {
    this._debug = false;

    this.mixpanel = $window.mixpanel;

    this.mixpanel_distinct_id = function() {
      return $window.mixpanel.cookie.props.distinct_id;
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

  })

  // Fire Mixpanel events based on route
  .run(function($rootScope, $location, $analytics) {
    $analytics._lastPageView = undefined;

    $rootScope.$on('$routeChangeSuccess', function(routeChangeEvent, currentRoute) {
      $analytics._lastPageViewAt = new Date();

      if (angular.isDefined($analytics._lastPageViewAt) && (new Date()).getTime() - $analytics._lastPageViewAt.getTime() < 10) {
        // Do nothing, likely a duplicate event
      } else if (!currentRoute.$$route) {
        $analytics.track(($location.path() === '/legacy' ? 'View Legacy' : 'View Not Found'), currentRoute.params);
      } else if (currentRoute.$$route.trackEvent !== false) {
        $analytics.track(currentRoute.$$route.trackEvent || 'View Other', currentRoute.$$route.trackEventOptions || currentRoute.params);
      }
    });
  });
