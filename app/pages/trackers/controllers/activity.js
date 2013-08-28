'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/trackers/:id/activity', {
        templateUrl: 'pages/trackers/activity.html',
        controller: 'TrackerActivity'
      });
  })
  .controller('TrackerActivity', function ($scope, $routeParams, $location, $api, $pageTitle) {
    $api.tracker_get($routeParams.id).then(function(tracker) {

      $pageTitle.set(tracker.name, 'Activity');

      // follow and unfollow API method wrappers
      tracker.follow = function() {
        if (!$scope.current_person) { return $api.require_signin(); }

        if (tracker.followed) {
          $api.tracker_unfollow($scope.tracker.id).then(function() {
            // assume API call success, update the button state (tracker.followed)
            tracker.followed = false;
          });
        } else {
          $api.tracker_follow($scope.tracker.id).then(function() {
            // assume API call success, update the button state (tracker.followed)
            tracker.followed = true;
          });
        }
      };

      $scope.tracker = tracker;
    });

    // TODO: Build API call that returns the following activities for a project tracker:
    // 1) bounties placed
    // 2) bounty claims submitted
    // 3) claims in dispute period
    // 4) claims accepted/paid out

    $scope.hasActivities = false;

    $scope.timeline = $api.tracker_get_activity($routeParams.id).then(function(activities) {
      var key, value, totalClaims, timeline;
      totalClaims = 0;
      timeline = [];

      if (activities.bounties.length > 0) {
        $scope.hasActivities = true;

        for (var i = 0; i < activities.bounties.length; i ++) {
          activities.bounties[i].type = "bounty";
          timeline.push(activities.bounties[i]);
        }
      }

      for (key in activities.claims) {
        value = activities.claims[key];
        if (value.length > 0) {
          totalClaims += value.length;

          for (var e = 0; e < value.length; e++) {
            value[e].type = key;
            timeline.push(value[e]);
          }
        }
      }

      if (totalClaims > 0) {
        $scope.hasActivities = true;
      }
      window.activities = activities;
      window.timeline = timeline;
      return timeline;
    });
  });
