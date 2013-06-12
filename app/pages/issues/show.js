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
    $scope.issue = $api.issue_get($routeParams.id);
  });

