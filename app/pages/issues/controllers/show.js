'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id', {
        templateUrl: 'pages/issues/show.html',
        controller: 'IssueShow'
      });
  })

  .controller('IssueShow', function ($scope, $routeParams, $window, $location, $payment, $api) {
    $scope.active_tab = function(name) {
      if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
      if (name === 'comments' && (/^\/issues\/[a-z-_0-9]+\/comments$/).test($location.path())) { return "active"; }
      if (name === 'bounties' && (/^\/issues\/[a-z-_0-9]+\/bounties$/).test($location.path())) { return "active"; }
      if (name === 'solutions' && (/^\/issues\/[a-z-_0-9]+\/solutions$/).test($location.path())) { return "active"; }
    };

    $scope.bounty = {
      amount: parseInt($routeParams.amount, 10),
      anonymous: $routeParams.anonymous || false,
      payment_method: $routeParams.payment_method || 'google'
    };

    $scope.solution_status = function(solution) {
      if (!solution.submitted) {
        return 'started';
      } else if (solution.submitted && !solution.merged) {
        return 'pending_merge';
      } else if (solution.in_dispute_period && !solution.disputed) {
        return 'in_dispute_period';
      } else if (solution.disputed) {
        return 'disputed';
      } else if (solution.rejected) {
        return 'rejected';
      } else if (solution.accepted) {
        return 'accepted';
      }
    };

    $scope.reload_solution_status = function(solution) {
      var status = $scope.solution_status(solution);

      // progress bar status
      if (status === "started") {
        $scope.my_solution_progress = { value: 25, type: "progress-info", status: status, description: "You have started working on a solution." };
      } else if (status === "pending_merge") {
        $scope.my_solution_progress = { value: 50, type: "progress-success", status: status, description: "Your solution has been submitted. Waiting for the issue to be resolved" };
      } else if (status === "in_dispute_period") {
        $scope.my_solution_progress = { value: 75, type: "progress-success", status: status, description: "The issue has been resolved, and your solution is in the dispute period." };
      } else if (status === "disputed") {
        $scope.my_solution_progress = { value: 75, type: "progress-warning", status: status, description: "Your solution has been disputed." };
      } else if (status === "rejected") {
        $scope.my_solution_progress = { value: 75, type: "progress-error", status: status, description: "Your solution has been rejected." };
      } else if (status === "accepted") {
        $scope.my_solution_progress = { value: 100, type: "progress-success", status: status, description: "Your solution has been accepted!" };
      }
    };

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      // append item number now that we have issue
      $scope.bounty.item_number = "issues/"+issue.id;

      // select the current user's solution if it's there
      for (var i=0; $scope.current_person && i<issue.solutions.length; i++) {
        if (issue.solutions[i].person.id === $scope.current_person.id) {
          $scope.my_solution_master = angular.copy(issue.solutions[i]);
          $scope.my_solution = angular.copy(issue.solutions[i]);
          break;
        }
      }

      // for each solution, load the disputes
      angular.forEach(issue.solutions, function(solution) {
        solution.disputes = $api.disputes_get(issue.id, solution.id, function(response) {
          // locate your dispute (skip resolved disputes)
          for (var i=0; i<response.data.length; i++) {
            if (!response.data[i].closed && response.data[i].person.id === $scope.current_person.id) {
              solution.$my_dispute = response.data[i];
              break;
            }
          }

          // define dispute methods after the disputes array is present on solution
          $scope.dispute_solution = function(issue, solution, form_data) {
            console.log('dispute_solution', arguments);

            $api.dispute_create(issue.id, solution.id, form_data, function(response) {
              if (response.meta.success) {
                // set my solution and hide the dispute form
                solution.$my_dispute = angular.copy(response.data);
                solution.$show_dispute = false;

                // add the dispute to solution
                solution.disputes.push(response.data);
              } else {
                solution.$dispute_error = response.data.error;
              }
            });
          };

          $scope.resolve_dispute = function(issue, solution, dispute) {
            $api.dispute_resolve(issue.id, solution.id, dispute.number, function(response) {
              console.log(response);

              if (response.meta.success) {
                dispute.closed = true;
              } else {
                $scope.$dispute_error = response.data.error;
              }
            });
          };

          return response.data;
        });
      });

      // build the status hash for my solution
      if ($scope.my_solution) { $scope.reload_solution_status($scope.my_solution); }

      $scope.create_payment = function() {
        var base_url = $window.location.href.replace(/\/issues.*$/,'');
        var payment_params = angular.copy($scope.bounty);

        payment_params.success_url = base_url + "/activity/bounties";
        payment_params.cancel_url = $window.location.href;

        $payment.process(payment_params, {
          error: function(response) {
            console.log("Payment Error:", response);
          },

          noauth: function() {
            $api.set_post_auth_url("/issues/" + $scope.issue.id, payment_params);

            $location.url("/signin");
          }
        });
      };

      $scope.create_solution = function() {
        $api.solution_create($routeParams.id, function(response) {
          if (response.meta.success) {
            $scope.my_solution = response.data;
            $scope.reload_solution_status($scope.my_solution);

            // add the solution to issue.solutions so that it shows up in the table
            issue.solutions.push($scope.my_solution);
          } else {
            $scope.error = response.data.error;
          }
        });
      };

      $scope.destroy_solution = function(solution) {
        $scope.solution_error = null;
        $api.solution_destroy(solution.id, function(response) {
          if (response.meta.success) {
            // remove the solution from issue.solutions to get it out of the table
            for (var i=0; i<issue.solutions.length; i++) {
              if (issue.solutions[i].id === $scope.my_solution.id) {
                issue.solutions.splice(i,1);
                break;
              }
            }

            // then null out my solution
            $scope.my_solution = null;
          } else {
            $scope.solution_error = response.data.error;
          }
        });
      };

      $scope.submit_solution = function(solution) {
        $scope.solution_error = null;

        // first update the solution...
        $api.solution_update(solution.id, $scope.my_solution, function(response) {
          if (response.meta.success) {
            $scope.my_solution = angular.copy(response.data);
            $scope.reload_solution_status($scope.my_solution);

            //... then submit it!
            $api.solution_submit(solution.id, function(response) {
              if (response.meta.success) {
                $scope.my_solution = angular.copy(response.data);
                $scope.reload_solution_status($scope.my_solution);

                // find the solution issue.solutions array and update its attributes
                for (var i=0; i<issue.solutions.length; i++) {
                  if (issue.solutions[i].id === $scope.my_solution.id) {
                    for (var k in $scope.my_solution) { issue.solutions[i][k] = $scope.my_solution[k]; }
                    break;
                  }
                }

              } else {
                $scope.solution_error = response.data.error;
              }
            });
          } else {
            $scope.solution_error = response.data.error;
          }
        });

      };

      return issue;
    });

    $scope.init_dispute = function(solution) {
      solution.new_dispute = solution.new_dispute || { body: "" };
    };

  });

