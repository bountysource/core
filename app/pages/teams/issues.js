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
    $scope.issues_resolved = false;

    $scope.issue_sort = {
      column: "created_at",
      desc: true
    };

    $scope.update_sort = function(obj, column) {
      if (obj.column === column) {
        obj.desc = !obj.desc;
      } else {
        obj.column = column;
        obj.desc = true;
      }
    };

    $scope.issues = []; $scope.issues_resolved = true; // replace line with api call, setting $scope.issues

  });