'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/trackers/:id', {
        templateUrl: 'pages/trackers/show.html',
        controller: 'TrackerShow',
        reloadOnSearch: false,
        trackEvent: 'View Tracker'
      });
  })
  .controller('TrackerShow', function ($scope, $routeParams, $location, $api, $pageTitle, $timeout) {
    $api.tracker_get($routeParams.id).then(function(tracker) {
      // Edge case: GitHub repo changes owner, and we create a new Tracker model.
      // If the requested tracker model has a redirect to another, change the URL to that tracker.
      if (($routeParams.id || '').split('-')[0] !== tracker.id) {
        $location.path("/trackers/"+tracker.slug).replace();
      }

      $pageTitle.set(tracker.name, 'Projects');

      // follow and unfollow API method wrappers
      tracker.follow = function() {
        if (!$scope.current_person) { return $api.require_signin(); }

        if (tracker.followed) {
          // assume API call success, update the button state (tracker.followed)
          tracker.followed = false;
          $api.tracker_unfollow($routeParams.id);
        } else {
          tracker.followed = true;
          $api.tracker_follow($routeParams.id);
        }
      };

      // Load issues for tracker. If the tracker was just created (has not been synced yet),
      // throw in a timeout to allow time for issues to be added
      $timeout(function() {
        $api.tracker_issues_get($routeParams.id).then(function(issues) {
          $scope.issues_resolved = true;
          $scope.open_bounties = 0; //frontend count of unclaimed bounties
          for (var i=0; i<issues.length; i++) {
            issues[i].bounty_total = parseFloat(issues[i].bounty_total);
            if (issues[i].bounty_total > 0 && !issues[i].paid_out) {
              $scope.open_bounties++;
            }
            // sorting doesn't like nulls.. this is a quick hack
            issues[i].participants_count = issues[i].participants_count || 0;
            issues[i].thumbs_up_count = issues[i].thumbs_up_count || 0;
            issues[i].comment_count = issues[i].comment_count || 0;
          }
          $scope.issues = issues;
          return issues;
        });
      }, tracker.synced_at ? 0 : 2500);

      $scope.tracker = tracker;
      return tracker;
    });

    $scope.issue_filter_options = {
      text: $location.search().text || null,
      bounty_min: $location.search().bounty_min || null,
      bounty_max: $location.search().bounty_max || null,
      only_valuable: $location.search().only_valuable || false,
      hide_closed: $location.search().hide_closed || false,
      hide_open: $location.search().hide_open || false,
      show_paid_out: $location.search().show_paid_out || false,
      sort: $location.search().sort || "bounty_total",
      sort_asc: $location.search().sort_asc || false,
      show_issue_id: $location.search().show_issue_id || false,
      show_issue_number: $location.search().show_issue_number || false
    };

    $scope.update_filter_options = function() {
      $scope.issue_filter_options.bounty_min = parseFloat($scope.issue_filter_options.bounty_min) || null;
      $scope.issue_filter_options.bounty_max = parseFloat($scope.issue_filter_options.bounty_max) || null;
    };

    $scope.issue_filter = function(issue) {
      var bounty_total = parseFloat(issue.bounty_total);
      var bounty_min = parseFloat($scope.issue_filter_options.bounty_min);
      var bounty_max = parseFloat($scope.issue_filter_options.bounty_max);

      if ($scope.issue_filter_options.show_paid_out ) {
        return issue.paid_out;
      }
      if (!$scope.issue_filter_options.show_paid_out && issue.paid_out) {
        return false;
      }
      if (!isNaN(bounty_min) && bounty_total < bounty_min) {
        return false;
      }
      if (!isNaN(bounty_max) && bounty_total > bounty_max) {
        return false;
      }
      if ($scope.issue_filter_options.only_valuable && bounty_total <= 0) {
        return false;
      }
      if ($scope.issue_filter_options.hide_closed && $scope.issue_filter_options.hide_open) {
        return false;
      }
      if ($scope.issue_filter_options.hide_closed) {
        return issue.can_add_bounty;
      }
      if ($scope.issue_filter_options.hide_open && !issue.paid_out) {
        return !issue.can_add_bounty;
      }
      if ($scope.issue_filter_options.text) {
        var regexp = new RegExp(".*?"+$scope.issue_filter_options.text+".*?", "i");
        return regexp.test(issue.title) || (issue.number && issue.number.toString() === $scope.issue_filter_options.text) ;
      }

      return true;
    };

    $scope.change_order_col = function(col) {
      if ($scope.issue_filter_options.sort === col) {
        $scope.issue_filter_options.sort_asc = !$scope.issue_filter_options.sort_asc;
      } else {
        $scope.issue_filter_options.sort_asc = false;
        $scope.issue_filter_options.sort = col;
      }
    };

    // override the filter and sort settings to only show open bounties
    $scope.show_bounties = function() {
      $scope.issue_filter_options = { only_valuable: true, sort: 'bounty_total' };
    };

    $scope.show_claimed_bounties = function() {
      $scope.issue_filter_options = { show_paid_out: true, sort: 'bounty_total' };
    };

    $scope.tracker_stats = $api.tracker_stats($routeParams.id).then(function(tracker_stats) {
      return tracker_stats;
    });

    $scope.update_filter_options();
    //populate bindings with bounty_min, bounty_max

  });
