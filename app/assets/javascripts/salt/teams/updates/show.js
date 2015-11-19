angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.updates.show', {
    url: "/teams/{slug}/updates/{number}?id",
    templateUrl: "salt/teams/updates/show.html",
    container: false,
    controller: function($rootScope, $scope, $stateParams, update) {
      $rootScope.title = update.title;
      $scope.update = update;
      $scope.active_update_number = parseInt($stateParams.number);
    },
    resolve: {
      update: function($state, $stateParams, updates) {
        for (var i=0; i < updates.length; i++) {
          if (updates[i].number === parseInt($stateParams.number)) {
            return updates[i];
          }
        }
        return $stateProvider.rejectedPromise();
      }
    }
  });
});
