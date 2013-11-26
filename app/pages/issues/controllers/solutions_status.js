'use strict';

angular.module('app')
  .controller('SolutionsStatusController', function ($scope, $routeParams, $api) {
    $api.solutions_get($routeParams.id).then(function (response) {
      $scope.solutions = response;
      console.log("solutions ", $scope.solutions);
    });
  });
