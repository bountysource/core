'use strict';

angular.module('app')
  .controller('IssueProposalsController', function ($scope, $window, $routeParams, $modal, $cart, $location, Proposal) {
    $scope.showDueDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.dueDatePickerOpened = true;
    };

    $scope.showProposalModal = function (proposal) {
      // Save reference to the parent scope
      var parentScope = $scope;

      $modal.open({
        templateUrl: 'app/issues/templates/proposal_show_modal.html',
        controller: function ($scope, $modalInstance) {
          $scope.proposal = proposal;

          $scope.close = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.accept = function () {
            if ($window.confirm("Are you sure?")) {
              var attributes = angular.copy(proposal);
              angular.extend(attributes, {currency: 'USD'});
              proposal.$accept(function () {
                $scope.close();
                $cart.addProposal(attributes).then(function () {
                  $location.url('/cart');
                });
              });
            }
          };

          $scope.reject = function () {
            if ($window.confirm("Are you sure?")) {
              proposal.$reject(function () {
                $scope.close();
                parentScope.proposals = Proposal.query({ issue_id: $routeParams.id, include_person: true });
                parentScope.renderAction = parentScope.renderIssueCalltoAction();
              });
            }
          };
        }
      });
    };







//    /* TODO: figure out proposals */
//
//    // Explicitly set to null until resolved with a boolean value
//    $scope.canManageIssue = null;
//
//
//    /**
//     * Request for Proposals
//     * */
//      // TODO only request if person is authenticated
//    $scope.requestForProposal = new RequestForProposal({ issue_id: $routeParams.id });
//
//    // Save promise returned by Resource.$get for
//    // use in epic auth stuff below.
//    var requestForProposalPromise = $scope.requestForProposal.$get({ include_team: true });
//
//    // Default to a new instance of Proposal.
//    // After loading all Proposals below, overwrite this with the current_user's proposal.
//    $scope.myProposal = new Proposal({
//      issue_id: $routeParams.id,
//      currency_iso: 'USD'
//    });
//    $scope.myProposal.$mine();
//
//    // Request all Proposals if current user is authenticated
//    // TODO only request if person is authenticated
//    $scope.proposals = Proposal.query({
//      issue_id: $routeParams.id,
//      include_person: true
//    });
//
//    /**
//     * Wait for both the issue and the bounties to resolve
//     * TODO cry as we write tests for this
//     * */
//    $scope.rfpAuthorizationResolved = false;
//    $q.all([
//      $scope.issue.$promise,
//      bounties.$promise
//    ])
//    /**
//     * Then perform some setup with Issue
//     * and set the page title
//     * */
//      .then(function (result) {
//        var issue = result[0];
//        var bounties = result[1];
//
//        issue.bounties = bounties;
//        $scope.bounties = bounties;
//        $pageTitle.set(issue.title, issue.tracker.name);
//
//        return new CurrentPersonResolver();
//      })
//
//    /**
//     * Then Load teams for the current user
//     *
//     * NOTE: `angular.noop` provided as error callback to continue
//     * down the chain if person is not logged in. Think
//     * before you take it out.
//     * */
//      .then(function (person) {
//        return $api.person_teams(person.id);
//      }, angular.noop)
//
//    /**
//     * Then check to see if the current user is a member
//     * of the team that owns this issue tracker
//     * */
//      .then(function (teams) {
//        var isOwnerOfIssue = !!_.find(teams, function (team) {
//          return team.id === ($scope.issue.owner && $scope.issue.owner.id);
//        });
//
//        $scope.canManageIssue = isOwnerOfIssue;
//        $scope.teamHasRfpEnabled = $scope.issue.owner && $scope.issue.owner.rfp_enabled;
//
//        return requestForProposalPromise;
//      })
//
//    /**
//     * Then hide the Proposals tab if the person is
//     * not a member of the managing Team AND there is no
//     * RFP on the Issue OR if the team does not have
//     * RFP enabled
//     * */
//      .then(function () {
//        $scope.displayRfpTab = feature.enabled('rfp') && $scope.issue.owner && $scope.issue.owner.rfp_enabled;
//      }, function () {
//        $scope.displayRfpTab = feature.enabled('rfp') && $scope.issue.owner && $scope.issue.owner.rfp_enabled && $scope.canManageIssue;
//      })
//
//    /**
//     * Finally, the promise is resolved!
//     * Does not care if anything goes wrong
//     * TODO care if something goes wrong
//     * */
//      .finally(function () {
//        $scope.rfpAuthorizationResolved = true;
//        // one function to determine call-to-action rendering
//        $scope.renderAction = $scope.renderIssueCalltoAction();
//      });
//
//    $scope.renderIssueCalltoAction = function () {
//      if(!$scope.teamHasRfpEnabled || !feature.enabled('rfp') || ($scope.teamHasRfpEnabled && !$scope.canManageIssue && !$scope.requestForProposal.saved() )) {
//        return "show_dev_goals";
//        // Proposal has already been accepted
//      } else if ($scope.requestForProposal.pendingFulfillment()) {
//        return "show_proposal_accepted";
//
//        // Team Member
//      } else if ($scope.canManageIssue && !$scope.requestForProposal.saved()) {
//        return "show_admin_create_request_for_proposal";
//
//      } else if ($scope.canManageIssue && $scope.requestForProposal.saved()) {
//        // User can manage issue and there is a created RFP
//        if ($scope.proposals.length <= 0) {
//          // No proposals submitted
//          return "show_admin_no_proposals";
//        } else {
//          // Proposals have been submitted
//          if($scope.pendingProposals($scope.proposals)) {
//            return "show_admin_pending_proposals";
//          } else {
//            return "show_admin_no_pending_proposals";
//          }
//        }
//
//        // Public
//      } else if (!$scope.canManageIssue) {
//        if ($scope.myProposal.saved()) {
//          return "show_user_proposal_status";
//        } else {
//          // public user has no proposal and issue is still taking proposals
//          return "show_user_requesting_proposals";
//        }
//      }
//    };
//
//    $scope.pendingProposals = function (proposals) {
//      for (var i = 0; i < proposals.length; i++) {
//        if(proposals[i].isPending() || proposals[i].isPendingAppointment() ) { return true; }
//      }
//    };
//
//    $scope.saveRequestForProposal = function () {
//      if ($window.confirm("Are you sure?")) {
//        $scope.requestForProposal.$save({ currency: $currency.value }, function () {
//          $scope.requestForProposal = new RequestForProposal({ issue_id: $routeParams.id });
//          $scope.requestForProposal.$get({ include_team: true });
//          $scope.renderAction = $scope.renderIssueCalltoAction();
//        });
//      }
//    };
//
//    $scope.saveProposal = function () {
//      if ($window.confirm("Are you sure?")) {
//        var payload = {
//          currency: $currency.value, // TODO kind of lame that we have to post currency like this. pass in header?
//          access_token: $api.get_access_token() // Ensure access token is sent!
//        };
//
//        $scope.myProposal.$save(payload, function (proposal) {
//          $scope.myProposal = new Proposal(angular.extend(proposal, { issue_id: $routeParams.id }));
//          $scope.renderAction = $scope.renderIssueCalltoAction();
//        });
//      }
//    };
//
//    $scope.deleteProposal = function () {
//      if ($window.confirm("Are you sure?")) {
//        $scope.myProposal.$delete(function () {
//          $scope.myProposal = new Proposal({ issue_id: $routeParams.id });
//          // re-render call-to-action banner
//          $scope.renderAction = $scope.renderIssueCalltoAction();
//        });
//      }
//    };

  });
