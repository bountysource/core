'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/comments', {
        templateUrl: 'pages/issues/comments.html',
        controller: 'IssueComments'
      });
  })
  .controller('IssueComments', function ($scope, $routeParams, $api) {
    $scope.issue = $api.issue_get($routeParams.id);
  });

