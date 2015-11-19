'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/tracker_merges', {
        templateUrl: 'admin/tracker_merges/index.html',
        controller: "TrackerMergesController"
      });
  })
  .controller("TrackerMergesController", function ($scope, $window, $api) {
    $scope.show_merged_trackers = false;

    $scope.tracker_merges = $api.tracker_merges_get();

    // Refresh the TrackerMerge content
    $scope.refresh = function() {
      $scope.tracker_merges = $api.tracker_merges_get();
    };

    // Sync the list of TrackerMerges
    $scope.sync_tracker_merges = function() {
      if (confirm("This may take a while. Are you sure?")) {
        $scope.sync_submitted = new Date();
        $api.tracker_merges_sync();
      }
    };

    // Submit sync for a tracker
    $scope.sync_tracker = function(tracker) {
      // Store local cache that persists through clicking the refresh button
      tracker.$sync_submitted = new Date();
      $api.tracker_sync(tracker.id);
    };

    // Merge the two Trackers together
    $scope.run_tracker_merge = function(tracker_merge) {
      tracker_merge.$merge_submitted = new Date();
      $api.tracker_merge_run(tracker_merge.id);
    };

    $scope.destroy_tracker_merge = function(tracker_merge) {
      if (confirm("Are you sure? Evisceration is painful.")) {
        $api.tracker_merge_destroy(tracker_merge.id);

        $scope.tracker_merges.then(function(tracker_merges) {
          for (var i=0; i<tracker_merges.length; i++) {
            if (tracker_merges[i].id === tracker_merge.id) {
              tracker_merges.splice(i,1);
              break;
            }
          }
        });
      }
    };
  });
