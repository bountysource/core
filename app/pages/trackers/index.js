'use strict';

angular.module('app.controllers').controller('TrackersIndex', function ($scope, $api) {
  $scope.per_page = 50;

  $scope.projects_promise = $api.call("/trackers", "GET", { per_page: $scope.per_page }, function(response) {
    // set pagination data
    $scope.$pagination = response.meta.pagination;
    for (var i=0; i<response.data.length; i++) {
      $scope.$init_project(response.data[i]);
    }
    $scope.projects = response.data;
    return response.data;
  });

  $scope.$init_project = function(project) {
    // turn bounty total into float
    project.bounty_total = parseFloat(project.bounty_total);
  };

  $scope.change_page = function(page) {
    $scope.projects = [];
    $scope.projects_promise = $api.call("/trackers", "GET", { per_page: 50, page: page }, function(response) {
      $scope.$pagination = response.meta.pagination;
      for (var i=0; i<response.data.length; i++) {
        $scope.$init_project(response.data[i]);
      }
      $scope.projects = response.data;
      return response.data;
    });
  };
});
