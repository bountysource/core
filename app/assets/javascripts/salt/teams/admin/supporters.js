angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin.supporters', {
    url: "/teams/{slug}/admin/supporters",
    templateUrl: "salt/teams/admin/supporters.html",
    container: false,
    controller: function($scope, supporters_for_team) {
      $scope.supporters_for_team = supporters_for_team;
    },
    resolve: {
      supporters_for_team: function($api, $stateParams) {
        return $api.support_levels.query({ supporters_for_team: $stateParams.slug }).$promise;
      }
    }
  });
});
