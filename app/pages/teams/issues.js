'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/teams/:id/issues', {
      templateUrl: 'pages/teams/issues.html',
      controller: 'BaseTeamController',
      reloadOnSearch: false,
      trackEvent: 'View Team Issues'
    });
  })
  .controller('TeamIssuesController', function ($scope, $routeParams, $api, $location, $window) {
    // render defaults
    $scope.maxPaginationSize = 15; // how many pages to show in the pagination bar
    $scope.issues_resolved = false;
    $scope.show_advanced_search = false;
    $scope.search_parameters = {
      show_team_issues: parseParams($routeParams.show_team_issues),
      show_related_issues: parseParams($routeParams.show_related_issues),
      direction: "desc",
      order: "rank"
    };

    // query object
    $scope.query = {};

    $scope.toggle_advanced_search = function () {
      $scope.show_advanced_search = !$scope.show_advanced_search;
      // when hiding the advanced_search, clear those fields
      if (!$scope.show_advanced_search) {
        delete $scope.search_parameters.query;
        delete $scope.search_parameters.created_at;
        delete $scope.search_parameters.active_since;
      }
    };

    $scope.update_sort = function(column, page) {
      if ($scope.search_parameters.order === column) {
        // if its the same column, simply reverse the direction
        if ($scope.search_parameters.direction === 'asc') {
          $scope.search_parameters.direction = 'desc';
        } else {
          $scope.search_parameters.direction = 'asc';
        }
      } else {
        $scope.search_parameters.direction = "desc"; //assume that if you are changing the order you want desc already
      }
      $scope.search_parameters.order = column;
      $scope.get_team_issues(page);
    };

    $scope.get_team_issues = function (page, per_page) {
      $scope.team_promise.then(function (team) {
        // loading bar rendering
        // $scope.issues_resolved = false;
        var dogeParams = buildSearchParameters(team);
        if (dogeParams) {
          $api.page(page).perPage(per_page || 25).team_issues(dogeParams).then(function(issues_response) {
            updateIssues(issues_response);
          });
        } else {
          $scope.issues = [];
          $scope.pagination = false;
          updateIssues($scope.issues);
        }
      });
    };

    function buildSearchParameters (team) {
      // build parameters for these cases:
      // 1. Return ONLY issues owned by the team (owner_id + owner_type)
      // 2. Return ONLY those issues NOT owned by the team (owner)
      // 3. Return all issues associated with the team (combination of 1 + 2)
      var params = { order_by: 'IssueRank::TeamRank', team_id: team.id };
      if ($scope.search_parameters.show_team_issues && $scope.search_parameters.show_related_issues) {
        return params;
      } else if ($scope.search_parameters.show_team_issues) {
        return angular.extend({ tracker_owner_id: team.id, tracker_owner_type: team.type }, params);
      } else if ($scope.search_parameters.show_related_issues) {
        return angular.extend({ tracker_owner_id: "!"+team.id, tracker_owner_type: "!"+team.type }, params);
      } else {
        return false;
        // need to return empty list of isssues
      }
    }

    function updateIssues (issues_data) {
      if (issues_data.meta) { $scope.pagination = issues_data.meta.pagination; }
      $scope.issues = issues_data.data;
      $scope.issues_resolved = true;

      var new_params = angular.extend($routeParams, {
        show_team_issues: ($scope.search_parameters.show_team_issues) ? 1 : 0,
        show_related_issues: ($scope.search_parameters.show_related_issues) ? 1 : 0
      });
      if ($scope.pagination){
        angular.extend(new_params, {page: $scope.pagination.page});
      }
      delete new_params.id;
      $location.search(new_params);
    }

    function parseParams (param) {
      if($window.parseInt(param, 10).toString() === "NaN") {
        return true;
      } else if ($window.parseInt(param, 10) === 1) {
        return true;
      } else if ($window.parseInt(param, 10) === 0) {
        return false;
      }
    }

    // load team issues when the page is first loaded

    $scope.get_team_issues($window.parseInt($routeParams.page, 10) || 1, 25);

  });
