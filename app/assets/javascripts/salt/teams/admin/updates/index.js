'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin.updates.index', {
    url: "/teams/{slug}/admin/updates",
    templateUrl: "salt/teams/admin/updates/index.html",
    container: false,
    controller: function($rootScope, $scope, $state, updates) {
      $scope.updates = updates;
    },
    resolve: {
      updates: function($api, $stateParams) {
        return $api.team_updates.query({ team_slug: $stateParams.slug, include_unpublished: true, limit: 25 }).$promise;
      }
    }
  });
});
