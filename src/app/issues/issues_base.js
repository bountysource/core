'use strict';

angular.module('app').controller('IssuesBaseController', function ($scope, $routeParams, $window, $analytics, $pageTitle, $api, Issue, Tracker, IssueBadge, Bounties, RequestForProposal, Team, Proposal) {

  // Explicitly set to null until resolved with a boolean value
  $scope.canManageIssue = null;
  
  // Load issue object
  $scope.issue = Issue.get({
    id: $routeParams.id,
    include_body_html: true,
    include_author: true,
    include_tracker: true,
    include_owner: true
  }, function (issue) {
    $pageTitle.set(issue.title, issue.tracker.name);

    // Create issue badge!
    $scope.issueBadge = new IssueBadge(issue);
  });

  // Load issue bounties
  $scope.bounties = Bounties.get({
    issue_id: $routeParams.id,
    include_owner: true,
    order: '+amount'
  }, function (bounties) {
    $scope.issue.$promise.then(function (issue) {
      issue.bounties = bounties;
    });
  });

  // Load Tracker owner to check if it's a team that has RFP enabled.
  // Assign $scope.rfpEnabled for checks errwhere.
  // TODO This realllllyyyyyyy wants to be cached. All of this shit does. It's not even funny.
  $scope.issue.$promise.then(function (issue) {
    var team = new Team(issue.owner);
    $scope.rfpEnabled = team.rfpEnabled();

    // verify if user is a part of the team that manages this issue.
    // for now. can't take it anymore
    $scope.$watch('current_person', function (person) {
      if (angular.isObject(person)) {
        $api.person_teams(person.id).then(function(teams) {
          // set current persons teams
          for (var i = 0; i < teams.length; i++) {
            if(teams[i].id === $scope.issue.owner.id) {
              $scope.canManageIssue = true;
              return $scope.canManageIssue;
            }
          }

          // if it goes through entire loop and doesn't find the team
          $scope.canManageIssue = false;
        });
      } else if (person === false) {
        $scope.canManageIssue = false;
      }
    });
  });

  $scope.requestForProposal = new RequestForProposal({ issue_id: $routeParams.id });
  $scope.requestForProposal.$get({ include_team: true });

  // Default to a new instance of Proposal.
  // After loading all Proposals below, overwrite this with the current_user's proposal.
  $scope.myProposal = new Proposal({ issue_id: $routeParams.id });

  $scope.proposals = Proposal.query({
    issue_id: $routeParams.id
  }, function (proposals) {
    // Find proposal created by current_user
    // If person logged in, replace new instance with already created Proposal.
    $scope.$watch('current_person', function (person) {
      if (angular.isObject(person)) {
        for (var i=0; i<proposals.length; i++) {
          if (proposals[i].person_id === person.id) {
            $scope.myProposal = new Proposal(angular.extend(proposals[i], { issue_id: $routeParams.id }));
            break;
          }
        }
      }
    });
  });

  $scope.saveRequestForProposal = function () {
    if ($window.confirm("Are you sure?")) {
      $scope.requestForProposal.$save(function () {
        $scope.requestForProposal = new RequestForProposal({ issue_id: $routeParams.id });
        $scope.requestForProposal.$get({ include_team: true });
      });
    }
  };

  $scope.saveProposal = function () {
    if ($window.confirm("Are you sure?")) {
      $scope.myProposal.$save(function (proposal) {
        $scope.myProposal = new Proposal(angular.extend(proposal, { issue_id: $routeParams.id }));
      });
    }
  };

  $scope.deleteProposal = function () {
    if ($window.confirm("Are you sure?")) {
      $scope.myProposal.$delete(function () {
        $scope.myProposal = new Proposal({ issue_id: $routeParams.id });
      });
    }
  };

  // Listen for developer goal create/updates. Broadcast update to all Controller instances.
  $scope.$on('developerGoalCreatePushed', function(event, new_developer_goal) {
    $scope.$broadcast('developerGoalCreateReceived', new_developer_goal);
  });

  $scope.$on('developerGoalUpdatePushed', function(event, updated_developer_goal) {
    $scope.$broadcast('developerGoalUpdateReceived', updated_developer_goal);
  });

  $scope.$on('developerGoalDeletePushed', function(event, deleted_developer_goal) {
    $scope.$broadcast('developerGoalDeleteReceived', deleted_developer_goal);
  });

  // Listen for solution create/updates. Broadcast update to all Controller instances.
  $scope.$on('solutionCreatePushed', function(event, new_solution) {
    $scope.$broadcast('solutionCreateReceived', new_solution);
  });

  $scope.$on('solutionUpdatePushed', function(event, updated_solution) {
    $scope.$broadcast('solutionUpdateReceived', updated_solution);
  });

  $scope.bountyTabClicked = function() {
    $analytics.bountyStart({ type: 'tab' });
  };

  $scope.bountyClaimTabClicked = function() {
    $analytics.startBountyClaim($routeParams.id, { type: 'tab' });
  };
});
