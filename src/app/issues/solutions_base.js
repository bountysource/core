'use strict';

angular.module('app').controller('SolutionsBaseController', function ($rootScope, $scope, $api, $filter, $q, $routeParams, $window, $analytics) {
  $scope.initializing = true;

  // initialize form from params
  $scope.show_solution_form = false || $routeParams.show_new_solution_form;
  var completion_date = $routeParams.completion_date ? $window.moment($routeParams.completion_date).format("M-D-YYYY") : null;
  $scope.solution_form = {
    url: $routeParams.code_url || "",
    note: $routeParams.note || "",
    completion_date: completion_date
  };

  $scope.my_solution = undefined;
  $scope.bounty_total = 0;

  // DatePicker Behavior //
  $scope.show_datepicker = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker_open = !$scope.datepicker_open;
  };

  $scope.show_edit_datepicker = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker_edit_open = !$scope.datepicker_edit_open;
  };

  $scope.minDate = $window.moment();

  $api.issue_get($routeParams.id).then(function(issue) {
    $scope.bounty_total = parseInt(issue.bounty_total, 10);

    $scope.solutions_promise = $api.solutions_get(issue.id).then(function(solutions) {
      // Get the lastest event and set as the Solution status
      for (var i=0; i<solutions.length; i++) {
        // api call will return array from newest to oldest
        solutions[i].status = solutions[i].solution_events[0];
      }

      $scope.solutions = solutions;
      return solutions;
    });

    // If the person is logged in, attempt to find their developer goal
    $scope.my_solution_promise = $api.solution_get(issue.id).then(function(my_solution) {
      $scope.initializing = false;
      if(!my_solution.error) {

        $scope.set_status_for_solution(my_solution);
        $scope.solution_form = {
          completion_date: $filter('date')(my_solution.completion_date, 'M-d-y'),
          url: my_solution.url,
          note: my_solution.note
        };
        // by default, hide the solution edit form
        $scope.show_solution_edit_form = $routeParams.show_solution_edit_form;
      }
      $scope.my_solution = my_solution;
      return my_solution;
    });

    $scope.start_solution = function () {
      // TODO: refactor all of these into one function. They all handle the same case.
      var parsed_time = $window.moment($scope.solution_form.completion_date);
      if (!parsed_time.parsingFlags().nullInput && !parsed_time.isValid()) {
        $scope.error = "Invalid date. Please use mm/dd/yyyy";
      } else if ( !parsed_time.parsingFlags().nullInput && parsed_time.isBefore($window.moment()) ) {
        $scope.error = "You can't use dates in the past.";
      } else {
        var data_payload = angular.copy($scope.solution_form);
        data_payload.completion_date = parsed_time.isValid() ? parsed_time : "";
        $api.start_solution(issue.id, data_payload).then(function(new_solution) {
          $scope.$emit('solutionCreatePushed', new_solution);
          $scope.show_solution_form = false;

          // Track Solution submit event in Mixpanel.
          // Only if the user is logged in
          $scope.$watch('current_person', function(person) {
            if (person) {
              $analytics.submitSolutionCreate($routeParams.id);
            }
          });
        });
      }
    };

    $scope.update_solution = function () {
      // TODO: refactor all of these into one function. They all handle the same case.
      var parsed_time = $window.moment($scope.solution_form.completion_date);
      if (!parsed_time.parsingFlags().nullInput && !parsed_time.isValid()) {
        $scope.error = "Invalid date. Please use mm/dd/yyyy";
      } else if (!parsed_time.parsingFlags().nullInput && parsed_time.isBefore($window.moment()) ) {
        $scope.error = "You can't use dates in the past.";
      } else {
        var data_payload = angular.copy($scope.solution_form);
        data_payload.completion_date = parsed_time.isValid() ? parsed_time : "";
        $api.update_solution(issue.id, data_payload).then(function(updated_solution) {
          $scope.show_solution_edit_form = false;
          $scope.$emit('solutionUpdatePushed', updated_solution);

          // Track Solution submit event in Mixpanel
          $analytics.submitSolutionEdit($routeParams.id);
        });
      }
    };

    $scope.restart_solution = function () {
      // TODO: refactor all of these into one function. They all handle the same case.
      var parsed_time = $window.moment($scope.solution_form.completion_date);
      if (!parsed_time.parsingFlags().nullInput && !parsed_time.isValid()) {
        $scope.error = "Invalid date. Please use mm/dd/yyyy";
      } else if (!parsed_time.parsingFlags().nullInput && parsed_time.isBefore($window.moment())) {
        $scope.error = "You can't use dates in the past.";
      } else {
        var data_payload = angular.copy($scope.solution_form);
        data_payload.completion_date = parsed_time.isValid() ? parsed_time : "";
        $api.restart_solution(issue.id, data_payload).then(function(updated_solution) {
          $scope.show_solution_edit_form = false;
          $scope.$emit('solutionUpdatePushed', updated_solution);
        });
      }
    };

    $scope.toggle_solution_edit_form = function () {
      $scope.show_solution_edit_form = !$scope.show_solution_edit_form;

      // Track Solution start in Mixpanel
      if ($scope.show_solution_edit_form) {
        $analytics.startSolutionEdit($routeParams.id);
      } else {
        $analytics.hideSolutionEdit($routeParams.id);
      }
    };

    $scope.toggle_solution_form = function () {
      $scope.show_solution_form = !$scope.show_solution_form;

      // Track Solution start in Mixpanel
      if ($scope.show_solution_form) {
        $analytics.startSolutionCreate($routeParams.id);
      } else {
        $analytics.hideSolutionCreate($routeParams.id);
      }
    };

    // Stop working on a solution that the logged in user started
    $scope.stop_solution = function () {
      $analytics.deleteSolutionPrompt($routeParams.id);

      if ($window.confirm("Are you sure you want to notify the backers that you have stopped work?")) {
        $scope.my_solution_promise.then(function() {
          $api.stop_solution(issue.id).then(function(updated_solution) {
            $scope.show_solution_edit_form = false;
            $scope.$emit('solutionUpdatePushed', updated_solution);

            $analytics.deleteSolutionConfirm($routeParams.id);
          });
        });
      } else {
        $analytics.deleteSolutionClose($routeParams.id);
      }
    };

    // Declare that the logged in person is continuing to work on their solution
    $scope.checkin_solution = function () {
      $scope.my_solution_promise.then(function() {
        $api.checkin_solution(issue.id).then(function(updated_solution) {
          $scope.$emit('solutionUpdatePushed', updated_solution);

          $analytics.checkinSolution($routeParams.id);
        });
      });
    };

    // Declare that the logged in person is finished working on their solution
    $scope.complete_solution = function () {
      $scope.my_solution_promise.then(function() {
        $api.complete_solution(issue.id).then(function(updated_solution) {
          $scope.$emit('solutionUpdatePushed', updated_solution);

          $analytics.completeSolution($routeParams.id);
        });
      });
    };

    return issue;
  });

  $scope.$on('solutionCreateReceived', function(event, new_solution) {
    var deferred = $q.defer();
    deferred.resolve(new_solution);
    $scope.my_solution = deferred.promise;
    $scope.solutions_promise.then(function(solutions) {
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
      //update corresponding object in $scope.solutions_promise array to show correct solution status
      $scope.solutions_promise.then(function (new_solutions_array) {
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
