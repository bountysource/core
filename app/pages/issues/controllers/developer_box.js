'use strict';

angular.module('app').controller('DeveloperBoxController', function ($scope, $routeParams, $location, $api) {

  $scope.issue.then(function(issue) {

    issue.create_solution = function() {
      $api.solution_create(issue.id, function(response) {
        if (response.meta.success) {
          issue.my_solution = response.data;
          issue.solutions.push(issue.my_solution);

          // this is usually set by the solutions controller. womp womp
          issue.my_solution.$percentage = 25;
        } else {
          $scope.error = response.data.error;
        }
      });
    };

    // do you has a solution?
    issue.my_solution = null;
    for (var i in issue.solutions) {
      if ($scope.current_person && issue.solutions[i].person.id === $scope.current_person.id) {
        issue.my_solution = issue.solutions[i];
        break;
      }
    }
  });

});
