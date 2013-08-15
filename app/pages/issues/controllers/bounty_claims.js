'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/claims', {
        templateUrl: 'pages/issues/bounty_claims.html',
        controller: 'BountyClaimsController'
      });
  })
  .controller('BountyClaimsController', function ($scope, $routeParams, $location, $window, $api) {
    $scope.new_bounty_claim = {
      code_url: "",
      description: ""
    };

    $scope.show_new_claim_form = false;

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      // initialize all bounty claims
      for (var i=0; i<issue.bounty_claims.length; i++) { $scope.$init_bounty_claim(issue.bounty_claims[i]); }

      // console.log('issue', issue);

      // locate the winning bounty claim, sets issue.$winning_bounty_claim
      $scope.$set_winning_bounty_claim(issue);

      // submit a new bounty claim
      $scope.bounty_claim_submit = function() {
        if ($scope.new_bounty_claim.code_url || $scope.new_bounty_claim.description) {
          $api.bounty_claim_create(issue.id, $scope.new_bounty_claim).then(function(bounty_claim) {
            console.log('bounty_claim create', bounty_claim);

            if (!bounty_claim.error) {
              // push new bounty claim into table
              issue.bounty_claims.push(bounty_claim);

              $location.url("/issues/"+issue.slug+"/solutions");
            }
          });
        }
      };

      // define filter to white the table down
      $scope.claims_table_filter = function(claim) {
        // if claim removed from list, skip
        if (!claim) { return false; }

        // reject the winning claim, it gets its own spot above the table
        if (issue.$winning_bounty_claim && issue.$winning_bounty_claim.id === claim.id) { return false; }

        return true;
      };

      return issue;
    });

    $scope.$init_bounty_claim = function(bounty_claim) {
      // calculate acceptance percentage
      $scope.$update_percentage(bounty_claim);
      $scope.$update_my_response(bounty_claim);

      bounty_claim.accept = function() {
        if (bounty_claim.$my_response === true) {
          $api.bounty_claim_reset(bounty_claim.id).then(function(updates) {
            $scope.$update_bounty_claim(bounty_claim, updates);
          });
        } else {
          $api.bounty_claim_accept(bounty_claim.id).then(function(updates) {
            $scope.$update_bounty_claim(bounty_claim, updates);
          });
        }
      };

      // model for a new dispute
      bounty_claim.dispute = {
        description: ""
      };

      bounty_claim.reject = function() {
        if (bounty_claim.$my_response === false) {
          $api.bounty_claim_reset(bounty_claim.id).then(function(updates) {
            $scope.$update_bounty_claim(bounty_claim, updates);
          });
        } else {
          $api.bounty_claim_reject(bounty_claim.id, bounty_claim.dispute.description).then(function(updates) {
            $scope.$update_bounty_claim(bounty_claim, updates);
          });
        }
      };

      bounty_claim.destroy = function() {
        $api.bounty_claim_destroy(bounty_claim.id).then(function() {
          // just reload page
          $window.location.reload();
        });
      };
    };

    $scope.$update_bounty_claim = function(bounty_claim, updates) {
      for (var k in bounty_claim) { bounty_claim[k] = updates[k]; }
      $scope.$init_bounty_claim(bounty_claim);
    };

    $scope.$update_percentage = function(bounty_claim) {
      bounty_claim.$percentage = (bounty_claim.accept_count / bounty_claim.backers_count) || 0;
    };

    $scope.$update_my_response = function(bounty_claim) {
      bounty_claim.$my_response = bounty_claim.$my_response || null;
      for (var i=0; $scope.current_person && i<bounty_claim.responses.length; i++) {
        if (bounty_claim.responses[i].person.id === $scope.current_person.id) {
          bounty_claim.$my_response = bounty_claim.responses[i].value;
          break;
        }
      }
    }

    $scope.$set_winning_bounty_claim = function(issue) {
      issue.$winning_bounty_claim = issue.$winning_bounty_claim || issue.bounty_claims[0];
      var claim;
      for (var i=1; i<issue.bounty_claims.length; i++) {
        claim = issue.bounty_claims[i];
        if (claim.collected) {
          // if the claim was collected, no other claim can be the winner. break!
          issue.$winning_bounty_claim = issue.bounty_claims[i];
          break;
        } else if (!claim.disputed && !claim.rejected) {
          // for claims that are neither disputed nor rejected
          if (!issue.$winning_bounty_claim) {
            // we haven't set a winner yet, initialize it and continue
            issue.$winning_bounty_claim = issue.bounty_claims[i];
            continue;
          } else {
            // prioritize by creation date
            var current_claim_date = new Moment(issue.$winning_bounty_claim.created_at);
            var this_claim_date = new Moment(claim.created_at);
            if (this_claim_date < current_claim_date) {
              issue.$winning_bounty_claim = issue.bounty_claims[i];
              continue;
            }
          }
        }
      }
    };
  });
