'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.issues', {
    url: "/issues",
    templateUrl: "salt/issues/index.html",
    container: false,
    body_class: 'kanban-body',
    nav_container: false,
    controller: function($scope, issues) {
      $scope.issues = issues;

      $scope.workflow_states = [
        { state: 'issue_open_new', title: 'Backlog » Created', panel_class: 'panel-red', orderBy: '-created_at' },
        { state: 'issue_open_thumbed', title: 'Backlog » Thumbed', panel_class: 'panel-red', orderBy: '-thumbs_up_count' },
        { state: 'issue_open_goal_unmet', title: 'Open » Goal Not Met', panel_class: 'panel-primary' },
        { state: 'issue_open_sufficient_bounty', title: 'Open » Bounty Created', panel_class: 'panel-primary', orderBy: '-bounty_total' },
        { state: 'issue_open_work_started', title: 'Open » Work Started', panel_class: 'panel-primary', orderBy: '-bounty_total' },
        { state: 'issue_closed_unclaimed', title: 'Closed » Bounty Unclaimed', panel_class: 'panel-primary', orderBy: '-bounty_total' },
        // { state: 'issue_closed_rejected_claims', title: 'issue_closed_rejected_claims' },
        // { state: 'issue_closed_claim_vote_needed', title: 'issue_closed_claim_vote_needed' },
        // { state: 'issue_closed_claim_waiting', title: 'issue_closed_claim_waiting' },
        { state: 'issue_closed_claimed', title: 'Closed » Claim Pending', panel_class: 'panel-primary', orderBy: '-bounty_total' },
        { state: 'issue_closed_complete', title: 'Complete', panel_class: 'panel-green', orderBy: '-remote_updated_at' }
      ];

    },
    resolve: {
      auth: $stateProvider.personRequired,

      issues: function($api, $stateParams, person) {
        return $api.issues.query_v3({ workflow: true }).$promise;
      }
    }
  });
});
