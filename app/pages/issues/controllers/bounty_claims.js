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
      code_url: $routeParams.code_url || "",
      description: $routeParams.description || ""
    };

    $scope.show_new_claim_form = parseInt($routeParams.show_new_claim_form, 10);
    $scope.claim_accepted = false;
    $scope.can_respond_to_claims = false;

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      // redirect to overview if the issue is not closed yet
      // AND the issue is not generic
      if (!issue.generic && issue.can_add_bounty && (/\/issues\/[^\/]+\/claims$/).test($location.path())) {
        $location.url("/issues/"+$routeParams.id).replace();
      }

      // initialize all bounty claims
      for (var i=0; i<issue.bounty_claims.length; i++) {
        $scope.$init_bounty_claim(issue.bounty_claims[i]);

        // has the person accepted a claim already?
        if (!$scope.claim_accepted && $scope.current_person && issue.bounty_claims[i].value === true) {
          $scope.claim_accepted = true;
        }

        // can you respond to claims?
        // determine if you can accept/reject claims
        if ($scope.current_person && issue.bounties[i] && issue.bounties[i].person && issue.bounties[i].person.id === $scope.current_person.id) {
          $scope.can_respond_to_claims = true;
          break;
        }
      }

      // submit a new bounty claim
      $scope.bounty_claim_submit = function() {
        if (!$scope.current_person) {
          $api.set_post_auth_url($location.path(), $scope.new_bounty_claim);
          $location.url("/signin");
        } else if ($scope.new_bounty_claim.code_url || $scope.new_bounty_claim.description) {
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

      return issue;
    });

    $scope.$init_bounty_claim = function(bounty_claim) {
      // calculate acceptance percentage
      $scope.$update_percentage(bounty_claim);
      $scope.$update_my_response(bounty_claim);

      bounty_claim.accept = function() {
        $api.bounty_claim_accept(bounty_claim.id).then(function(updates) {
          $scope.$update_bounty_claim(bounty_claim, updates);
        });
      };

      // model for a new dispute
      bounty_claim.show_dispute_form = false;
      bounty_claim.new_dispute = { description: "" };
      bounty_claim.submit_reject = function() {
        $api.bounty_claim_reject(bounty_claim.id, bounty_claim.new_dispute.description).then(function(updates) {
          bounty_claim.show_dispute_form = false;
          $scope.$update_bounty_claim(bounty_claim, updates);
        });
      };

      bounty_claim.reject = function() {
        bounty_claim.show_dispute_form = true;
      };

      bounty_claim.show_resolve_form = false;
      bounty_claim.new_resolve = { description: "" };
      bounty_claim.resolve = function() {
        if (bounty_claim.$my_response === false) {
          $api.bounty_claim_resolve(bounty_claim.id, bounty_claim.new_resolve.description).then(function(updated_bounty_claim) {
            $scope.$update_bounty_claim(bounty_claim, updated_bounty_claim);
          });
        }
      };

      bounty_claim.destroy = function() {
        $api.bounty_claim_destroy(bounty_claim.id).then(function() {
          // just reload page
          $window.location.reload();
        });
      };

      bounty_claim.reset = function() {
        $api.bounty_claim_reset(bounty_claim.id).then(function(updates) {
          $scope.$update_bounty_claim(bounty_claim, updates);
        });
      };
    };

    $scope.$update_bounty_claim = function(bounty_claim, updates) {
      for (var k in bounty_claim) { bounty_claim[k] = updates[k]; }
      $scope.$init_bounty_claim(bounty_claim);

      // is it now accepted? reload!
      if (bounty_claim.collected) {
        $window.location.reload();
      }

      // update whether or not the user has accepted a claim
      if ($scope.current_person) { $scope.claim_accepted = true; }
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
    };

    $scope.goto_claim_bounty = function() {
      if ($scope.current_person) {
        $location.path("issues/"+$routeParams.id+"/claims").search({ show_new_claim_form: 1 });
      } else {
        // save route, get auth, redirect
        $api.set_post_auth_url("/claims", { show_new_claim_form: true });
        $location.url("/signin");
      }
    };
  });
