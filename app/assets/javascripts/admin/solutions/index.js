'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/solutions', {
    templateUrl: 'admin/solutions/index.html',
    controller: "SolutionsIndexController"
  });
})
.controller("SolutionsIndexController", function ($scope, $window, $api) {

  $scope.sort = {
    col: "id",
    reverse: true
  };

  $scope.update_sort = function(column) {
    if ($scope.sort.col === column) {
      $scope.sort.reverse = !$scope.sort.reverse;
    } else {
      $scope.sort.col = column;
    }
  };

  $api.get_solutions().then(function (response) {
    if (response.meta.success) {
      $scope.solutions = response.data;
      console.log($scope.solutions);
    } else {
      $scope.error = response.data;
    }
  });

});
