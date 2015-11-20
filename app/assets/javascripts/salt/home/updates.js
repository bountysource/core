angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.home.updates', {
    url: "/updates",
    title: "Updates",
    templateUrl: "salt/home/updates.html",
    container: false,
    controller: function($scope, team_updates) {
      $scope.team_updates = team_updates;
    },
    resolve: {
      team_updates: function($api) {
        return $api.team_updates.query().$promise;
      }
    }
  });
});
