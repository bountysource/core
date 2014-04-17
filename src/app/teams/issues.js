'use strict';

angular.module("app").controller('TeamIssuesController', function ($scope, $api) {

  $scope.team_promise.then(function (team) {

    $scope.getIssues = function (page) {

      if($scope.bounty_max < $scope.bounty_min) {
        $scope.show_bounty_error = true;
        return;
      }

      $scope.show_bounty_error = false;
      var selected_tracker_ids = getTrackerIds();
      $api.v2.issues({
        search: $scope.search || null,
        tracker_owner_type: "Team",
        tracker_owner_id: team.id,
        include_tracker: true,
        tracker_id: selected_tracker_ids.toString() || null,
        can_add_bounty: createIssueStatusParam($scope.issueStatus),
        paid_out: createPaidStatusParam($scope.issueStatus),
        bounty_min: $scope.bounty_min,
        bounty_max: $scope.bounty_max,
        order: $scope.order || "+bounty",
        page: page || 1,
        per_page: $scope.per_page || 30
      }).then(function (response) {
        $scope.issues = angular.copy(response.data);

        setPagination({
          total_pages: response.headers()['total-pages'],
          total_items: response.headers()['total-items'],
          page: response.config.params.page,
          per_page: response.config.params.per_page
        });
      });
    };

    $scope.getTrackers = function (team) {
      $api.v2.trackers({
        owner_id: team.id,
        owner_type: "Team"
      }).then(function (response) {
        $scope.trackers = response.data;
      });
    };

    $scope.getTrackers(team);

    $scope.getIssues();
  });

  // initialize selected_trackers object
  $scope.selected_trackers = {};

  // initialize issue-status filter button group
  $scope.issueStatus = "open";

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

  // get tracker_ids for tracker_filtering
  function getTrackerIds () {
    var processed_tracker_ids = [];
    var tracker_ids = Object.keys($scope.selected_trackers);
    for (var i = 0; i < tracker_ids.length; i++) {
      if ($scope.selected_trackers[tracker_ids[i]]) {
        processed_tracker_ids.push(tracker_ids[i]);
      }
    }
    return processed_tracker_ids;
  }

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
