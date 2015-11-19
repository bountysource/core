'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.supporters', {
    url: "/teams/{slug}/supporters",
    templateUrl: "salt/teams/supporters.html",
    container: false,
    controller: function($rootScope, $scope, $state, supporters) {
      $scope.supporters = supporters;
    },
    resolve: {
      supporters: function($api, $stateParams) {
        return $api.supporters.query({ team_slug: $stateParams.slug, per_page: 100, order: 'monthly' }).$promise;
      }
    }
  });
});
