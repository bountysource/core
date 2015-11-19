'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin', {
    abstract: true,
    params: { slug: '@slug' },
    templateUrl: "salt/teams/admin/base.html",
    resolve: {
      team_admin: function(team) {
        if (!team.is_admin) {
          return $stateProvider.rejectedPromise();
        }
      }
    }
  });
});
