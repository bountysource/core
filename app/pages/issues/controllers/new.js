'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/new', {
        templateUrl: 'pages/issues/new.html',
        controller: 'IssueCreateController',
        title: 'Add Issue'
      });
  })

  .controller('IssueCreateController', function ($scope, $location, $api) {
    $scope.new_issue = {};

    $scope.create_issue = function() {
      $scope.error = null;
      $api.issue_create($scope.new_issue, function(response) {
        if (response.meta.success) {
          $location.url("/issues/"+response.data.slug).replace();
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });

