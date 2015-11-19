'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.updates', {
    template: "<ui-view/>",
    controller: function($rootScope, $scope, $state, updates) {
      $scope.updates = updates;
    },
    resolve: {
      updates: function($api, $stateParams) {
        return $api.team_updates.query({ team_slug: $stateParams.slug, include_body: true, limit: 25 }).$promise;
      }
    }
  });
});
