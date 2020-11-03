angular.module("app").controller('TeamIssuesController', function ($scope, $api, $routeParams, $location, $anchorScroll, feature) {

  $scope.issue_grid_view = false;

  // page initializers
  // initialize selected_trackers object
  function initializeTrackersFromParams (params) {
    if (params.tracker_ids) {
      var tracker_id_array = params.tracker_ids.split(",");
      var new_selected_trackers = {};
      for (var i = 0; i < tracker_id_array.length; i++) {
        new_selected_trackers[tracker_id_array[i]] = true;
      }
      return new_selected_trackers;
    }
  }

  $scope.rfpEnabled = feature.enabled('rfp');

  $scope.selected_trackers = initializeTrackersFromParams($routeParams) || {};
  // need to use 0 or 1 instead of true/false because $routeParams reads true/false as strings
  //$scope.acceptingProposals = parseInt($routeParams.accepting_proposals, 10) || 0;

  $scope.team_promise.then(function (team) {

    $scope.getIssues = function (page) {
      $scope.issues = false;

      if($scope.bounty_max < $scope.bounty_min) {
        $scope.show_bounty_error = true;
        return;
      }

      $scope.show_bounty_error = false;
      var selected_tracker_ids = getTrackerIds();
      //updateRouteParams({ accepting_proposals: $scope.acceptingProposals });
      var defaultOrder = "+thumbs";
      $api.v2.issues({
        search: $scope.search || null,
        tracker_team_id: team.id,
        include_tracker: true,
        include_body_html: true,
        tracker_id: selected_tracker_ids.toString() || null,
        can_add_bounty: createIssueStatusParam($scope.issueStatus),
        paid_out: createPaidStatusParam($scope.issueStatus),
        //accepting_proposals: parseInt($scope.acceptingProposals, 10) === 1 ? true : false,
        bounty_min: $scope.bounty_min,
        bounty_max: $scope.bounty_max,
        order: $scope.order || defaultOrder,
        page: page || 1,
        per_page: $scope.per_page || 25
      }).then(function (response) {
        $scope.issues = angular.copy(response.data.issues);
        setPagination({
          total_pages: response.headers()['total-pages'],
          // total_items: response.headers()['total-items'],
          total_items: getFinalIssueCount($scope.trackers, response.config.params.tracker_id, response.config.params, response.data.total_count),
          page: response.config.params.page,
          per_page: response.config.params.per_page
        });

        $anchorScroll();
      });
    };

    $scope.getTrackers = function (team) {
      $api.v2.trackers({
        owner_team_id: team.id
      }).then(function (response) {
        $scope.trackers = response.data;
      });
    };

    $scope.getTrackers(team);

    $scope.getIssues();
  });

  // initialize issue-status filter button group
  $scope.issueStatus = "open";

  $scope.setSearchParameters = function (params) {
    $scope.order = params.order;
    $scope.getIssues($scope.page);
  };

  // pagination settings
  function setPagination (pagination_data) {
    $scope.page = pagination_data.page;
    // $scope.total_items = parseInt(pagination_data.total_items, 10);
    $scope.total_items = pagination_data.total_items;
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

    // update routeParams based on selected trackers
    if(processed_tracker_ids.length > 0) {
      updateRouteParams({"tracker_ids": processed_tracker_ids.join(",")});
    }

    return processed_tracker_ids;
  }

  function updateRouteParams (options) {
    $location.search(options);
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

  function getFinalIssueCount (trackers, tracker_id, params, issue_count) {
    
    var total_count = 0;
    if ( params.search !== null || params.can_add_bounty === false || params.paid_out !== null || params.bounty_min !== undefined || params.bounty_min !== undefined ) {
      total_count = issue_count;
    } else if ( tracker_id !== null) {
      for (var i = 0; i < trackers.length; i++) {
        if ( trackers[i]["id"] === Number(tracker_id) ) {
           total_count = trackers[i]["open_issues"];
        }  
      }
    } else {
      for ( var j = 0; j < trackers.length; j++) {
        total_count += trackers[j]["open_issues"];
      }
    }
    return total_count;
  }
});
