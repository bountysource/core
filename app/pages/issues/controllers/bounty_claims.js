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

    $scope.show_new_claim_form = false;

    $scope.issue = $api.issue_get($routeParams.id).then(function(issue) {
      // initialize all bounty claims
      for (var i=0; i<issue.bounty_claims.length; i++) { $scope.$init_bounty_claim(issue.bounty_claims[i]); }

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
      bounty_claim.show_dispute_form = false;
      bounty_claim.new_dispute = { description: "" };
      bounty_claim.submit_reject = function() {
        $api.bounty_claim_reject(bounty_claim.id, bounty_claim.new_dispute.description).then(function(updates) {
          bounty_claim.show_dispute_form = false;
          $scope.$update_bounty_claim(bounty_claim, updates);
        });
      };

      bounty_claim.reject = function() {
        if (bounty_claim.$my_response === false) {
          $api.bounty_claim_reset(bounty_claim.id).then(function(updates) {
            $scope.$update_bounty_claim(bounty_claim, updates);
          });
        } else {
          bounty_claim.show_dispute_form = true;
        }
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
    };

    $scope.$update_bounty_claim = function(bounty_claim, updates) {
      for (var k in bounty_claim) { bounty_claim[k] = updates[k]; }
      $scope.$init_bounty_claim(bounty_claim);

      // is it now accepted?
      if (bounty_claim.collected) {
        $scope.issue.winning_bounty_claim = bounty_claim;
      }
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
  });
