'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/solutions', {
        templateUrl: 'pages/issues/solutions.html',
        controller: 'IssueSolutionsController'
      });
  })

  .controller('IssueSolutionsController', function ($scope, $routeParams, $location, $api) {

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      // set solution accepted bounty claim model
      $scope.$init_bounty_claim(issue);

      // make solutions disputable
      // store them on $scope.issue.solutions
      $scope.$init_solutions(issue);

      // select the current user's solution if it's there.
      // store it on $scope.issue.my_solution
      $scope.$locate_my_solution(issue);

      // find the logged in users bounty, if present.
      // need this to determine whether or not they can
      // dispute solutions.
      $scope.locate_my_bounty(issue);

      return issue;
    });

    $scope.locate_my_bounty = function(issue) {
      // TODO: note, this skips past anonymous pledges. might break things if it's your bounty that is anonymous
      $scope.my_bounty = null;
      for (var i=0; $scope.current_person && i<issue.bounties.length; i++) {
        if (issue.bounties[i].person && issue.bounties[i].person.id === $scope.current_person.id) {
          $scope.my_bounty = issue.bounties[i];
          break;
        }
      }
    };

    $scope.solution_submit = { body: "", code_url: "" };

    $scope.charity_focus = function(donation) { donation.$show_info = true; };
    $scope.charity_blur = function(donation) { donation.$show_info = false; };

    $scope.$init_bounty_claim = function(issue) {
      $scope.bounty_claim = {
        bounty_total: issue.bounty_total,
        donations: {
          eff: { amount: Math.floor(issue.bounty_total * 0.050), $show_info: false },
          fsf: { amount: Math.floor(issue.bounty_total * 0.025), $show_info: false },
          spi: { amount: Math.floor(issue.bounty_total * 0.025), $show_info: false },
          dwb: { amount: Math.floor(issue.bounty_total * 0.025), $show_info: false }
        },
        donation_total: 0,
        your_cut: issue.bounty_total
      };

      $scope.update_bounty_claim = function() {
        var donation_total = 0;
        for (var k in $scope.bounty_claim.donations) { donation_total += ($scope.bounty_claim.donations[k].amount || 0); }
        $scope.bounty_claim.donation_total = Math.min(donation_total, $scope.bounty_claim.bounty_total);
        $scope.bounty_claim.your_cut = Math.max(($scope.bounty_claim.bounty_total - donation_total), 0);
      };

      // initialize that shit.
      $scope.update_bounty_claim();
    };

    // form data for submitting solution
    $scope.my_solution_submit = {
      code_url: "",
      body: ""
    };

    $scope.$locate_my_solution = function(issue) {
      for (var i=0; $scope.current_person && i<issue.solutions.length; i++) {
        if (issue.solutions[i].person.id === $scope.current_person.id) {
          issue.my_solution = issue.solutions[i];
          break;
        }
      }

      // does the authenicated user have a solution?
      if (issue.my_solution) {
        // add submission method
        issue.my_solution.submit = function() {
          $scope.solution_error = null;

          // first update the solution...
          $api.solution_update(issue.my_solution.id, $scope.my_solution_submit, function(response) {
            if (response.meta.success) {
              //... then submit it!
              $api.solution_submit(issue.my_solution.id, function(response) {
                if (response.meta.success) {
                  $scope.my_solution = angular.copy(response.data);

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

        issue.my_solution.destroy = function() {
          console.log('TODO issue.my_solution.destroy');
        };

        if (issue.my_solution.accepted) {
          var default_donation_percentage = 0.05;
          var default_donation = (issue.bounty_total * default_donation_percentage);

          issue.my_solution.claim_bounty_data = {
            total: issue.bounty_total,
            donation: default_donation,
            dev_cut: issue.bounty_total  - default_donation
          };

          issue.my_solution.claim_bounty = function() {
            var donation_amounts = {
              eff_donation_amount: $scope.bounty_claim.donations.eff.amount,
              fsf_donation_amount: $scope.bounty_claim.donations.fsf.amount,
              spi_donation_amount: $scope.bounty_claim.donations.spi.amount,
              dwb_donation_amount: $scope.bounty_claim.donations.dwb.amount
            };

            $api.solution_payout(issue.my_solution.id, donation_amounts, function(response) {
              console.log(response);

              if (response.meta.success) {
                $location.url("/activity/solutions");
              } else {
                $scope.error = response.data.error;
              }
            });
          };
        }
      }

      // add model for submitting solution
      return $scope.issue.my_solution;
    };

    // add extra functionality and model data to a solution.
    $scope.$init_solution = function(issue, solution) {
      // calculate and add percentage to the model
      solution.$percentage = $scope.solution_percentage(solution);

      // add status
      solution.$status = $scope.solution_status(solution);

      // add dispute model
      solution.new_dispute = { body: "" };

      // add flag to show/hide the dispute form
      solution.$show_dispute = false;

      // init disputes to empty array. push the rest in asynchronously next
      solution.disputes = [];

      // push dispute and add extra methods, such as dispute resolve
      solution.push_dispute = function(dispute) {
        // if it's your dispute, store that now! only store if it is NOT CLOSED
        // make sure it references the array on solution
        // also, add a close method to it
        if (!dispute.closed && $scope.current_person.id === dispute.person.id) {
          solution.my_dispute = dispute;

          // add dispute resolution method
          dispute.resolve = function() {
            $api.dispute_resolve(issue.id, solution.id, solution.my_dispute.number, function(response) {
              if (response.meta.success) {
                solution.my_dispute.closed = true;

                // also, check to see if the issue can now be changed from 'disputed' to 'in dispute period'
                // this is pretty damn hacky...
                var change = true;
                for (var k in solution.disputes) { if (!solution.disputes[k].closed) { change = false; break; } }
                if (change) { solution.$status = 'In Dispute Period'; }
              } else {
                solution.my_dispute_error = response.data.error;
              }
            });
          };
        }
        solution.disputes.push(dispute);
      };

      // load disputes (different API call...)
      $api.disputes_get(issue.id, solution.id).then(function(disputes) {
        for (var j in disputes) { solution.push_dispute(disputes[j]); }
        return disputes;
      });

      // add dispute method (form action)
      solution.dispute = function() {
        $api.dispute_create(issue.id, solution.id, solution.new_dispute, function(response) {
          if (response.meta.success) {
            solution.$show_dispute = false;

            // manually change attributes, because YOLO
            solution.disputed = true;
            solution.$percentage = $scope.solution_percentage(solution);
            solution.$status = $scope.solution_status(solution);

            solution.push_dispute(response.data);
          } else {
            solution.dispute_error = response.data.error;
          }
        });
      };

      solution.$show_status_description = false;
      solution.$toggle_show_status_description = function() { solution.$show_status_description = !solution.$show_status_description; };
    };

    $scope.$init_solutions = function(issue) {
      var i;

      // if a solution was accepted, manually change the status of all issues to rejected.
      // the backend should do this.... kind of a hack for v2 development
      if (issue.accepted_solution) {
        // update all solutions except for that one to rejected status
        for (i=0; i<issue.solutions.length; i++) {
          if (issue.solutions[i].id !== issue.accepted_solution.id) {
            issue.solutions[i].rejected = true;
          }
        }
      }

      // now, go through and initialize solutions
      for (i in issue.solutions) { $scope.$init_solution(issue, issue.solutions[i]); }
    };

    $scope.solution_status = function(solution) {
      if (solution.rejected) { return 'rejected'; }
      else if (solution.disputed) { return 'disputed'; }
      else if (solution.accepted && !solution.paid_out) { return 'accepted'; }
      else if (solution.accepted && solution.paid_out) { return 'paid_out'; }
      else if (solution.submitted && !solution.merged) { return 'pending_merge'; }
      else if (solution.in_dispute_period && !solution.disputed && !solution.accepted) { return 'in_dispute_period'; }
      else if (!solution.submitted) { return 'started'; }
      else { return ""; }
    };

    $scope.solution_percentage = function(solution) {
      solution.$status = solution.$status || $scope.solution_status(solution);
      if (solution.$status === "started") { return 25; }
      else if (solution.$status === "pending_merge") { return 50; }
      else if (solution.$status === "in_dispute_period") { return 75; }
      else if (solution.$status === "disputed") { return 75; }
      else if (solution.$status === "rejected") { return 75; }
      else if (solution.$status === "accepted" || solution.$status === "paid_out") { return 100; }
      else { return 1; }
    };
  });

