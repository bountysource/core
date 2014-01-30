'use strict';

angular.module('app')
  .controller('SolutionsBaseController', function ($rootScope, $scope, $api, $filter, $q) {
    $scope.initializing = true;

    $scope.my_solution = undefined;
    $scope.bounty_total = 0;

    $scope.issue.then(function(issue) {
      $scope.bounty_total = parseInt(issue.bounty_total, 10);

      $scope.solutions = $api.solutions_get(issue.id).then(function(solutions) {
        // Get the lastest event and set as the Solution status
        for (var i=0; i<solutions.length; i++) {
          // api call will return array from newest to oldest
          solutions[i].status = solutions[i].solution_events[0];
        }
        return solutions;
      });

      // If the person is logged in, attempt to find their developer goal
      $scope.my_solution = $api.solution_get(issue.id).then(function(my_solution) {
        $scope.initializing = false;

        $scope.set_status_for_solution(my_solution);

        return my_solution;
      });

      // Decalre that the logged in person is working on a solution
      $scope.start_solution = function () {
        $api.start_solution(issue.id).then(function(new_solution) {
          $scope.$emit('solutionCreatePushed', new_solution);
        });
      };

      // Restart a solution that the logged in user said they stopped working on
      $scope.restart_solution = function () {
        $scope.my_solution.then(function() {
          $api.restart_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      // Stop working on a solution that the logged in user started
      $scope.stop_solution = function () {
        $scope.my_solution.then(function() {
          $api.stop_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      // Declare that the logged in person is continuing to work on their solution
      $scope.checkin_solution = function () {
        $scope.my_solution.then(function() {
          $api.checkin_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      // Declare that the logged in person is finished working on their solution
      $scope.complete_solution = function () {
        $scope.my_solution.then(function() {
          $api.complete_solution(issue.id).then(function(updated_solution) {
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        });
      };

      return issue;
    });

    $scope.$on('solutionCreateReceived', function(event, new_solution) {
      var deferred = $q.defer();
      deferred.resolve(new_solution);
      $scope.my_solution = deferred.promise;
      $scope.solutions.then(function(solutions) {
        var solution = angular.copy(new_solution);
        solution.status = solution.solution_events[solution.solution_events.length - 1];
        solutions.push(solution);
        return solutions;
      });
      $scope.set_status_for_solution(new_solution);
    });

    $scope.$on('solutionUpdateReceived', function(event, updated_solution) {
      if (updated_solution) {
        for (var k in updated_solution) {
          $scope.my_solution[k] = updated_solution[k];
        }
        $scope.set_status_for_solution(updated_solution);
      }
    });

    // Get the last event for a given solution
    $scope.set_status_for_solution = function(solution) {
      if (solution && solution.solution_events) {
        $scope.status = $filter('orderBy')(solution.solution_events, ["-created_at"])[0];
        //update corresponding object in $scope.solutions array to show correct solution status
        $scope.solutions.then(function (new_solutions_array) {
          for (var i = 0; i < new_solutions_array.length; i++) {
            if(new_solutions_array[i].id == solution.id) {
              for(var n in solution) {
                new_solutions_array[i][n] = solution[n];
              }
              new_solutions_array[i].status = solution.solution_events[0];
              break;
            }
          };
        });
      }
    };
  });
