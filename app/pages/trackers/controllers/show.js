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

      // Edge case: GitHub repo changes owner, and we create a new Tracker model.
      // If the requested tracker model has a redirect to another, change the URL to that tracker.
      if (($routeParams.id || '').split('-')[0] !== tracker.id) {
        $location.url("/trackers/"+tracker.slug).replace();
      }

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
      $scope.issues_resolved = true;

      for (var i=0; i<issues.length; i++) {
        issues[i].bounty_total = parseFloat(issues[i].bounty_total);

        // sorting doesn't like nulls.. this is a quick hack
        issues[i].participants_count = issues[i].participants_count || 0;
        issues[i].thumbs_up_count = issues[i].thumbs_up_count || 0;
        issues[i].comment_count = issues[i].comment_count || 0;
      }
      return issues;
    });

    $scope.issue_filter_options = {
      text:          $location.search().text                    || null,
      bounty_min:    $location.search().bounty_min              || null,
      bounty_max:    $location.search().bounty_max              || null,
      only_valuable: $location.search().only_valuable === 'true' || false,
      hide_closed:   $location.search().hide_closed   === 'true' || false,
      hide_open:     $location.search().hide_open     === 'true' || false,
      show_paid_out: $location.search().show_paid_out === 'true' || false,
      sort:          $location.search().sort || "bounty_total",
      sort_asc:      $location.search().sort_asc || false,
      show_issue_id: $location.search().show_issue_id || false,
      show_issue_number: $location.search().show_issue_number || false
    };

    $scope.$watch('issue_filter_options', function(filters) {
      var key, value;
      // remove falsy values
      for (key in filters) {
        value = filters[key];
        if (value === null || value === false || value === "bounty_total") {
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
