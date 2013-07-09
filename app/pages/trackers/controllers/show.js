'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/trackers/:id', {
        templateUrl: 'pages/trackers/show.html',
        controller: 'TrackerShow'
      });
  })
  .controller('TrackerShow', function ($scope, $routeParams, $api) {
    $api.tracker_get($routeParams.id).then(function(tracker) {
      // merge all of the issue arrays into one
      tracker.issues = [];
      for (var i in tracker.issues_valuable) { tracker.issues.push(tracker.issues_valuable[i]); }
      for (i in tracker.issues_popular) { tracker.issues.push(tracker.issues_popular[i]); }
      for (i in tracker.issues_newest) { tracker.issues.push(tracker.issues_newest[i]); }

      // turn all of the bounty totals into floats. dunno why that isn't the case.
      for (i in tracker.issues) { tracker.issues[i].bounty_total = parseFloat(tracker.issues[i].bounty_total); }

      // follow and unfollow API method wrappers
      tracker.follow = function() {
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

    $scope.issue_filter_options = {
      text: null,
      bounty_min: null,
      bounty_max: null,
      only_valuable: false,
      show_closed: true
    };

    $scope.update_filter_options = function() {
      $scope.issue_filter_options.bounty_min = parseFloat($scope.issue_filter_options.bounty_min);
      $scope.issue_filter_options.bounty_max = parseFloat($scope.issue_filter_options.bounty_max);
    };

    $scope.issue_filter = function(issue) {
      var bounty_total = parseFloat(issue.bounty_total);
      var bounty_min = parseFloat($scope.issue_filter_options.bounty_min);
      var bounty_max = parseFloat($scope.issue_filter_options.bounty_max);

      if (!isNaN(bounty_min) && bounty_total < bounty_min) {
        return false;
      }
      if (!isNaN(bounty_max) && bounty_total > bounty_max) {
        return false;
      }
      if ($scope.issue_filter_options.only_valuable && bounty_total <= 0) {
        return false;
      }
      if (!$scope.issue_filter_options.show_closed) {
        return issue.can_add_bounty;
      }

      if ($scope.issue_filter_options.text) {
        var regexp = new RegExp(".*?"+$scope.issue_filter_options.text+".*?", "i");
        return regexp.test(issue.title) || (issue.number && issue.number.toString() === $scope.issue_filter_options.text) ;
      }

      return true;
    };

    $scope.order_col = "bounty_total";
    $scope.order_reverse = true;
    $scope.change_order_col = function(col) {
      if ($scope.order_col === col) {
        $scope.order_reverse = !$scope.order_reverse;
      } else {
        $scope.order_reverse = true;
        $scope.order_col = col;
      }
    };
  });

