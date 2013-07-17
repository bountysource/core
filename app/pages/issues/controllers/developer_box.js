'use strict';

angular.module('app').controller('DeveloperBoxController', function ($scope, $routeParams, $location, $api) {
  $scope.issue.then(function(issue) {
    issue.create_solution = function() {
      $api.solution_create(issue.id, function(response) {
        if (response.meta.success) {
          $scope.my_solution = response.data;

          // emit event letting the solutions controller
          // know that a solution was created. yay for cross-controller
          // communication!
          $scope.$emit('mySolutionCreated', response.data, issue);
        } else {
          $scope.error = response.data.error;
        }
      });
    };
  });
});
