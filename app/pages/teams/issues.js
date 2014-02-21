'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/teams/:id/issues', {
    templateUrl: 'pages/teams/issues.html',
    controller: 'BaseTeamController'
  });
})
.controller('TeamIssuesController', function ($scope, $routeParams, $api) {
    // render defaults
    $scope.maxPaginationSize = 5; // how many pages to show in the pagination bar
    $scope.issues_resolved = false;
    $scope.show_advanced_search = false;
    $scope.search_parameters = {
      show_team_issues: true,
      show_related_issues: true,
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
      // loading bar rendering
      // $scope.issues_resolved = false;

      $scope.search_parameters.per_page = per_page || 25;
      $scope.search_parameters.page = page || 1;
      $api.team_issues($routeParams.id, $scope.search_parameters).then(function(search_data) {
        console.log(search_data);
        updateIssues(search_data);
      });

    };

    function updateIssues (data) {
      $scope.pageCount = Math.ceil(data.issues_count / $scope.search_parameters.per_page);
      $scope.issues_count = data.issues_count;
      $scope.issues = data.issues;
      $scope.issues_resolved = true;
    }

    // load team issues when the page is first loaded
    $scope.get_team_issues(1, 25);

  });
