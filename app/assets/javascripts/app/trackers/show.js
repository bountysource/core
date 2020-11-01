angular.module('app').controller('TrackerShow', function ($scope, $routeParams, $location, $api, $pageTitle, $timeout, $cookieJar, $anchorScroll, TrackerBadge, Tracker) {

  $scope.tracker = Tracker.get({ id: $routeParams.id, include_team: true }, function(tracker) {
    if (tracker.team && tracker.team.slug && !tracker.takendown) {
      $location.url("/teams/" + tracker.team.slug + "/issues?tracker_ids=" + tracker.id).replace();
    } else {
      // Load issues for tracker. If the tracker was just created (has not been synced yet),
      // throw in a timeout to allow time for issues to be added
      $timeout(function() {
        $scope.getIssues();
      }, tracker.synced_at ? 0 : 2500);

      $scope.trackerBadge = new TrackerBadge(tracker);
      // Edge case: GitHub repo changes owner, and we create a new Tracker model.
      // If the requested tracker model has a redirect to another, change the URL to that tracker.
      if (($routeParams.id || '').split('-')[0] !== tracker.id) {
        $location.path("/trackers/"+tracker.slug).replace();
      }

      $pageTitle.set(tracker.name, 'Projects');

      // initialize issue-status filter button group
      $scope.issueStatus = "open";

      // follow and unfollow API method wrappers
      tracker.follow = function() {
        if (!$scope.current_person) {
          $cookieJar.setJson('tracker_follow', $routeParams.id);
          return $api.require_signin();
        }

        if (tracker.followed) {
          // assume API call success, update the button state (tracker.followed)
          tracker.followed = false;
          $api.tracker_unfollow($routeParams.id);
        } else {
          tracker.followed = true;
          $api.tracker_follow($routeParams.id);
        }
      };
      // if cookie is set, call tracker.follow() when page is loaded
      if ($scope.current_person && ($cookieJar.getJson('tracker_follow') === $routeParams.id)) {
        $cookieJar.remove('tracker_follow');
        tracker.follow();
      }
    }
  });


  $scope.getIssues = function (page) {
    $api.v2.issues({
      search: $scope.search || null,
      tracker_id: $scope.tracker.id,
      can_add_bounty: createIssueStatusParam($scope.issueStatus),
      paid_out: createPaidStatusParam($scope.issueStatus),
      bounty_min: $scope.bounty_min,
      bounty_max: $scope.bounty_max,
      order: $scope.order || "+bounty",
      page: page || 1,
      per_page: $scope.per_page || 30
    }).then(function (response) {
        var issues = response.data.issues;
        $scope.issues_resolved = true;
        $scope.open_bounties = $scope.open_bounties || 0; //frontend count of unclaimed bounties
        if (!$scope.open_bounties) {
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
        }
        $scope.issues = issues;
        setPagination({
          total_pages: response.headers()['total-pages'],
          total_items: response.headers()['total-items'],
          page: response.config.params.page,
          per_page: response.config.params.per_page
        });
        $anchorScroll();
        return issues;
      });
  };

  //set the serach parameters
  $scope.setSearchParameters = function (params) {
    $scope.order = params.order;
    $scope.getIssues($scope.page);
  };

  // pagination settings
  function setPagination (pagination_data) {
    $scope.page = pagination_data.page;
    $scope.total_items = parseInt(pagination_data.total_items, 10);
    $scope.maxSize = 10;
    $scope.per_page = pagination_data.per_page;
  }

  // toggle advanced search collapse
  $scope.toggle_advanced_search = function () {
    $scope.show_advanced_search = !$scope.show_advanced_search;
  };

  // create the params for the issue status button-group filter
  function createIssueStatusParam (issue_status) {
    if (issue_status === 'open') {
      return true;
    } else if (issue_status === 'closed') {
      return false;
    } else {
      return null;
    }
  }

  function createPaidStatusParam (issue_status) {
    if (issue_status === "paid_out") {
      return true;
    } else {
      return null;
    }
  }
});
