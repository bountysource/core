'use strict';

angular.module('app').controller('BountyClaimsController', function ($scope, $route, $routeParams, $location, $window, $api, $analytics) {
  $scope.new_bounty_claim = {
    code_url: $routeParams.code_url || "",
    description: $routeParams.description || ""
  };

  $scope.show_new_claim_form = parseInt($routeParams.show_new_claim_form, 10);
  $scope.claim_accepted = false;
  $scope.can_respond_to_claims = false;

  $api.issue_get($routeParams.id).then(function(issue) {
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
    }

    // can you respond to claims?
    // determine if you can accept/reject claims
    $scope.can_respond_to_claims = issue.can_respond_to_claims;

    // submit a new bounty claim
    $scope.bounty_claim_submit = function() {
      if (!$scope.current_person) {
        $api.set_post_auth_url($location.path(), $scope.new_bounty_claim);
        $location.url("/signin");
      } else if ($scope.new_bounty_claim.code_url || $scope.new_bounty_claim.description) {
        $api.bounty_claim_create(issue.id, $scope.new_bounty_claim).then(function(bounty_claim) {
          if (!bounty_claim.error) {
            // push new bounty claim into table
            issue.bounty_claims.push(bounty_claim);
            $route.reload(); //hacky temporary solution

            $analytics.submitBountyClaim(issue.id);
          }
        });
      }
    };

    $scope.issue = issue;
    return issue;
  });

  $scope.$init_bounty_claim = function(bounty_claim) {
    // calculate acceptance percentage
    $scope.$update_percentage(bounty_claim);
    $scope.$update_my_response(bounty_claim);

    bounty_claim.show_claim_form = function(name) {
      switch(name) {
      case "accept":
        if (bounty_claim.showing_accept_form) {
          bounty_claim.showing_accept_form = false;
          break;
        }
        bounty_claim.showing_accept_form = true;
        bounty_claim.showing_dispute_form = false;
        bounty_claim.showing_resolve_form = false;
        break;
      case "dispute":
        if (bounty_claim.showing_dispute_form) {
          bounty_claim.showing_dispute_form = false;
          break;
        }
        bounty_claim.showing_dispute_form = true;
        bounty_claim.showing_accept_form = false;
        bounty_claim.showing_resolve_form = false;
        break;
      case "resolve":
        if (bounty_claim.showing_resolve_form) {
          bounty_claim.showing_resolve_form = false;
          break;
        }
        bounty_claim.showing_resolve_form = true;
        bounty_claim.showing_accept_form = false;
        bounty_claim.showing_dispute_form = false;
        break;
      default:
        bounty_claim.showing_resolve_form = false;
        bounty_claim.showing_accept_form = false;
        bounty_claim.showing_dispute_form = false;
        break;
      }
    };

    bounty_claim.new_accept = { description: "" };
    bounty_claim.accept = function() {
      $api.bounty_claim_accept(bounty_claim.id, bounty_claim.new_accept.description).then(function(updates) {
        $scope.$update_bounty_claim(bounty_claim, updates);

        $analytics.voteAcceptBountyClaim(bounty_claim.id, $routeParams.id);
      });
    };

    // model for a new dispute
    bounty_claim.new_dispute = { description: "" };
    bounty_claim.submit_reject = function() {
      // TODO: render error when submitting empty description. currently just fails w/o notification.
      $api.bounty_claim_reject(bounty_claim.id, bounty_claim.new_dispute.description).then(function(updates) {
        bounty_claim.showing_dispute_form = false;
        $scope.$update_bounty_claim(bounty_claim, updates);

        $analytics.voteRejectBountyClaim(bounty_claim.id, $routeParams.id);
      });
    };

    bounty_claim.reject = function() {
      bounty_claim.showing_dispute_form = true;
    };

    bounty_claim.new_resolve = { description: "" };
    bounty_claim.resolve = function() {
      if (bounty_claim.$my_response === false) {
        $api.bounty_claim_resolve(bounty_claim.id, bounty_claim.new_resolve.description).then(function(updated_bounty_claim) {
          $scope.$update_bounty_claim(bounty_claim, updated_bounty_claim);

          $analytics.voteAcceptBountyClaim(bounty_claim.id, $routeParams.id);
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
      if(bounty_claim.responses[i].person) {
        if (bounty_claim.responses[i].person.id === $scope.current_person.id) {
          bounty_claim.$my_response = bounty_claim.responses[i].value;
          break;
        }
      }
    }
  };

  // Redirect to the BountyClaims tab, prompts the user to login if they are not logged in yet.
  // Optionally, provide a type for tracking where this redirect was invoked, for analytics stuffs.
  $scope.redirectToBountyClaimTab = function(type) {
    $analytics.startBountyClaim($routeParams.id, { type: type || '$direct' });

    if ($scope.current_person) {
      $location.path('issues/' + $routeParams.id + '/claims');
    } else {
      // save route, get auth, redirect
      $api.set_post_auth_url('issues/' + $routeParams.id + '/claims');
      $location.url('/signin');
    }
  };
});
