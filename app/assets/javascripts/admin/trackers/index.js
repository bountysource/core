'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/trackers', {
    templateUrl: 'admin/trackers/index.html',
    controller: "Trackers"
  });
})
.controller("Trackers", function ($scope, $window, $api) {
  $scope.updatePage = function(page) {
    $scope.working = true;
    $api.get_trackers(page).then(function(response) {
      if (response.meta.success) {
        $scope.working = false;
        $scope.trackers = response.data;
        var pagination = response.meta.pagination;
        $scope.totalItems = pagination.items;
        $scope.itemsPerPage = pagination.per_page;
        $scope.currentPage = pagination.page || 1;
        $scope.pageCount = Math.ceil(pagination.items/pagination.per_page);
        $scope.maxSize = 10;
      } else {
        $scope.working = false;
        $scope.error = response.data.error;
        //do something with the error  
      }
    });
  };

  $scope.updatePage();

});
