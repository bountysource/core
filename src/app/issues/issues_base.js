'use strict';

angular.module('app').controller('IssuesBaseController', function ($scope, $routeParams, $analytics, $pageTitle, Issue, Tracker, IssueBadge, Bounties, RequestForProposal, Team, $api) {
  $scope.canManageIssue = false;

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
        };
      });
    }
  };

  $scope.requestForProposal = RequestForProposal.get({
    issue_id: $routeParams.id,
    include_team: true
  }, function (response) {
    debugger;
  }, function (response) {
    debugger;
  });

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
