'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/trackers/:id', {
        templateUrl: 'pages/trackers/show.html',
        controller: 'TrackerShow',
        reloadOnSearch: false
      });
  })
  .controller('TrackerShow', function ($scope, $routeParams, $location, $api, $pageTitle) {
    $api.tracker_get($routeParams.id).then(function(tracker) {

      $pageTitle.set(tracker.name, 'Projects');

      $scope.init_tags(tracker);

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

      // model to create a new tag
      tracker.new_tag = { name: null };

      // method to create new tags
      tracker.create_tag = function() {
        if (!$scope.current_person) { return $api.require_signin(); }
        $api.tracker_tags_create(tracker.id, tracker.new_tag.name).then(function(new_tag_relation) {
          // only push it if it doesn't exist
          var push_it_real_good = true;
          for (var i=0; i<tracker.tags.length; i++) {
            if (tracker.tags[i].id === new_tag_relation.id) {
              push_it_real_good = false;
            }
          }
          if (push_it_real_good) {
            $scope.init_tag(tracker, new_tag_relation);
            tracker.tags.push(new_tag_relation);
          }

          // null out the model
          tracker.new_tag.name = null;
        });
      };

      $scope.tracker = tracker;
    });

    // merge all of the issue arrays into one
    $scope.issues = $api.tracker_issues_get($routeParams.id).then(function(issues) {
      for (var i=0; i<issues.length; i++) { issues[i].bounty_total = parseFloat(issues[i].bounty_total); }
      return issues;
    });

    $scope.issue_filter_options = {
      text:          $location.search().text                    || null,
      bounty_min:    $location.search().bounty_min              || null,
      bounty_max:    $location.search().bounty_max              || null,
      only_valuable: $location.search().only_valuable == 'true' || false,
      hide_closed:   $location.search().hide_closed   == 'true' || false,
      hide_open:     $location.search().hide_open     == 'true' || false
    };

    $scope.$watch('issue_filter_options', function(filters) {
      var key, value;
      // remove falsy values
      for (key in filters) {
        value = filters[key];
        if (value === null || value === false) {
          delete filters[key];
        }
      }
      $location.search(filters).replace();
    }, true);

    $scope.update_filter_options = function() {
      $scope.issue_filter_options.bounty_min = parseFloat($scope.issue_filter_options.bounty_min) || null;
      $scope.issue_filter_options.bounty_max = parseFloat($scope.issue_filter_options.bounty_max) || null;
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
      if ($scope.issue_filter_options.hide_closed && $scope.issue_filter_options.hide_open) {
        return false;
      }
      if ($scope.issue_filter_options.hide_closed) {
        return issue.can_add_bounty;
      }
      if ($scope.issue_filter_options.hide_open) {
        return !issue.can_add_bounty;
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

    $scope.init_tags = function(tracker) {
      for (var i in tracker.tags) { $scope.init_tag(tracker, tracker.tags[i]); }
    };

    $scope.init_tag = function(tracker, tag_relation) {
      tag_relation.upvote = function() {
        if (!$scope.current_person) { return $api.require_signin(); }
        $api.tracker_tags_upvote(tracker.id, tag_relation.tag.name).then(function(updated_tag_relation) {
          update_tracker_relation(tracker, updated_tag_relation);
        });
      };

      tag_relation.downvote = function() {
        if (!$scope.current_person) { return $api.require_signin(); }
        $api.tracker_tags_downvote(tracker.id, tag_relation.tag.name).then(function(updated_tag_relation) {
          update_tracker_relation(tracker, updated_tag_relation);
        });
      };

      var update_tracker_relation = function(tracker, updated_relation) {
        // find the tracker relation on the tracker array, then update it's attributes
        for (var i=0; i<tracker.tags.length; i++) {
          if (tracker.tags[i].id === updated_relation.id) {
            for (var k in updated_relation) { tracker.tags[i][k] = updated_relation[k]; }
            break;
          }
        }
      };
    };

    // override the filter and sort settings to only show open bounties
    $scope.show_bounties = function() {
      $scope.order_col = "amount";
      $scope.issue_filter_options = { only_valuable: true };
    };
  });
