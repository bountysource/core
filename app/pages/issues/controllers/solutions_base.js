'use strict';

angular.module('app')
  .controller('SolutionsBaseController', function ($rootScope, $scope, $api, $filter, $q, $window, $routeParams) {
    $scope.foo = "bar";
    $scope.initializing = true;

    // initialize form from params
    $scope.show_solution_form = false || $routeParams.show_new_solution_form;
    var completion_date = $routeParams.completion_date ? $window.moment($routeParams.completion_date).format("M-D-YYYY") : null
    $scope.solution_form = {
      url: $routeParams.code_url,
      note: $routeParams.note,
      completion_date: completion_date
    };

    // by default, hide the solution edit form
    $scope.show_solution_edit_form = false;

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
        if(!my_solution.error) {

          $scope.set_status_for_solution(my_solution);
          $scope.solution_form = {
            completion_date: $filter('date')(my_solution.completion_date, 'M-d-y'),
            url: my_solution.url,
            note: my_solution.note
          };
        }
        return my_solution;
      });

      $scope.start_solution = function () {
        var parsed_time = $window.moment($scope.solution_form.completion_date, "M-D-YYYY");
        if (!parsed_time.isValid()) {
          $scope.error = "Invalid date. Please use mm/dd/yyyy";
        } else if ( parsed_time.isBefore($window.moment()) ) {
          $scope.error = "You can't use dates in the past.";
        } else {
          $scope.solution_form.completion_date = parsed_time;
          $api.start_solution(issue.id, $scope.solution_form).then(function(new_solution) {
            $scope.$emit('solutionCreatePushed', new_solution);
            $scope.show_solution_form = false;
          });
        }
      };

      $scope.update_solution = function () {
        var parsed_time = $window.moment($scope.solution_form.completion_date, "M-D-YYYY");
        if (!parsed_time.isValid()) {
          $scope.error = "Invalid date. Please use mm/dd/yyyy";
        } else if ( parsed_time.isBefore($window.moment()) ) {
          $scope.error = "You can't use dates in the past.";
        } else {
          $scope.solution_form.completion_date = parsed_time;
          $api.update_solution(issue.id, $scope.solution_form).then(function(updated_solution) {
            $scope.show_solution_edit_form = false;
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        }
      };

      $scope.restart_solution = function () {
        var parsed_time = $window.moment($scope.solution_form.completion_date, "M-D-YYYY");
        if (!parsed_time.isValid()) {
          $scope.error = "Invalid date. Please use mm/dd/yyyy";
        } else if ( parsed_time.isBefore($window.moment()) ) {
          $scope.error = "You can't use dates in the past.";
        } else {
          $scope.solution_form.completion_date = parsed_time;
          $api.restart_solution(issue.id, $scope.solution_form).then(function(updated_solution) {
            $scope.show_solution_edit_form = false;
            $scope.$emit('solutionUpdatePushed', updated_solution);
          });
        }
      };

      $scope.toggle_solution_edit_form = function () {
        $scope.show_solution_edit_form = !$scope.show_solution_edit_form;
      };

      $scope.toggle_solution_form = function () {
        $scope.show_solution_form = !$scope.show_solution_form;
      };

      // Stop working on a solution that the logged in user started
      $scope.stop_solution = function () {
        if ($window.confirm("Are you sure you want to notify the backers that you have stopped work?")) {
          $scope.my_solution.then(function() {
            $api.stop_solution(issue.id).then(function(updated_solution) {
              $scope.show_solution_edit_form = false;
              $scope.$emit('solutionUpdatePushed', updated_solution);
            });
          });
        }
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
            if(new_solutions_array[i].id === solution.id) {
              for(var n in solution) {
                new_solutions_array[i][n] = solution[n];
              }
              new_solutions_array[i].status = solution.solution_events[0];
              break;
            }
          }
        });
      }
    };
  });
