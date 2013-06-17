'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id', {
        templateUrl: 'pages/issues/show.html',
        controller: 'IssueShow'
      });
  })
  .controller('IssueShow', function ($scope, $routeParams, $api) {
    $scope.issue = $api.issue_get($routeParams.id).then(function(response) {
      console.log('issue', response);
      return response;
    });

    $scope.status_for_solution = function(solution) {
      if (!solution.submitted) {
        return 'started';
      } else if (solution.submitted && !solution.merged) {
        return 'pending_merge';
      } else if (solution.in_dispute_period && !solution.disputed) {
        return 'in_dispute_period';
      } else if (solution.disputed) {
        return 'disputed';
      } else if (solution.rejected) {
        return 'rejected';
      } else if (solution.accepted) {
        return 'accepted';
      }
    };

    $scope.row_class_for_solution = function(solution) {
      var status = $scope.status_for_solution(solution);

      if (status === 'started') {
        return;
      } else if (status === 'pending_merge') {
        return 'warning';
      } else if (status === 'in_dispute_period') {
        return 'info';
      } else if (status === 'disputed') {
        return 'warning';
      } else if (status === 'rejected') {
        return 'error';
      } else if (status === 'accepted') {
        return 'success';
      }
    };
  });

