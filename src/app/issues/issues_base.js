'use strict';

angular.module('app').controller('IssuesBaseController', function ($scope, $routeParams, $analytics, $pageTitle, Issue, Tracker, IssueBadge, Bounties, RequestForProposal, Team, Proposal, $api, $window) {
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

  // Probably bad design if i need to do this... Refactor
  var resolvedRenderable = function () {
    return ($scope.canManageIssue !== null) + $scope.requestForProposal.$resolved;
  };
  // Used to render the call-to-action box only when important variables have been populated
  $scope.$watch(resolvedRenderable, function (result) {
    if (result === 2) {
      $scope.resolved = true;
    }
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
    $scope.$watch('current_person', getTeams);
  });

  // verify if user is a part of the team that manages this issue.
  // for now. can't take it anymore
  var getTeams = function (person) {
    if(angular.isObject(person)) {
      $api.person_teams(person.id).then(function(teams) {
        // set current persons teams
        for (var i = 0; i < teams.length; i++) {
          if(teams[i].id === $scope.issue.owner.id) {
            $scope.canManageIssue = true;
            break;
          }
        }
        // if it goes through entire loop and doesn't find the team
        $scope.canManageIssue = $scope.canManageIssue || false;
      });
    }
  };

  $scope.requestForProposal = RequestForProposal.get({
    issue_id: $routeParams.id,
    include_team: true
  }, function (requestForProposal) {
    return requestForProposal;
  }, function (errorResponse) {
    $scope.requestForProposalError = errorResponse.data;
  });

  // Default to a new instance of Proposal.
  // After loading all Proposals below, overwrite this with the current_user's proposal.
  $scope.myProposal = new Proposal({ issue_id: $routeParams.id, amount: 150 });

  $scope.proposals = Proposal.query({
    issue_id: $routeParams.id
  }, function (proposals) {
    // Find proposal created by current_user
    // If person logged in, replace new instance with already created Proposal.
    $scope.$watch('current_person', function (person) {
      if (angular.isObject(person)) {
        for (var i=0; i<proposals.length; i++) {
          if (proposals[i].person_id === person.id) {
            $scope.myProposal = new Proposal(proposals[i]);
            break;
          }
        }
      }
    });
  });

  $scope.saveProposal = function () {
    if ($window.confirm("Are you sure?")) {
      $scope.myProposal.$save();
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
