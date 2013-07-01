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
      console.log(tracker);

      $scope.tracker = tracker;

      // merge all of the issue arrays into one
      tracker.issues = [];
      for (var i in tracker.issues_valuable) { tracker.issues.push(tracker.issues_valuable[i]); }
      for (var i in tracker.issues_popular) { tracker.issues.push(tracker.issues_popular[i]); }
      for (var i in tracker.issues_newest) { tracker.issues.push(tracker.issues_newest[i]); }

      // turn all of the bounty totals into floats. dunno why that isn't the case.
      for (var i in tracker.issues) { tracker.issues[i].bounty_total = parseFloat(tracker.issues[i].bounty_total); }
    });

    $scope.issue_filter_options = {
      text: null,
      bounty_min: null,
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

      if (!isNaN(bounty_min) && bounty_total < bounty_min) return false;
      if ($scope.issue_filter_options.only_valuable && bounty_total <= 0) return false;
      if (!$scope.issue_filter_options.show_closed) return issue.can_add_bounty;

      if ($scope.issue_filter_options.text) {
        var regexp = new RegExp(".*?"+$scope.issue_filter_options.text+".*?", "i");
        return regexp.test(issue.title) || (issue.number && issue.number.toString() === $scope.issue_filter_options.text) ;
      }

      return true;
    };

    $scope.order_col = "bounty_total";
    $scope.order_reverse = true;
    $scope.change_order_col = function(col) {
      console.log('change order!', 'old', $scope.order_col, $scope.order_reverse);
      if ($scope.order_col === col) {
        $scope.order_reverse = !$scope.order_reverse;
      } else {
        $scope.order_reverse = true;
        $scope.order_col = col;
      }
      console.log('new', $scope.order_col, $scope.order_reverse);
    };
  });

