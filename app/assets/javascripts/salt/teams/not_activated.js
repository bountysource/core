angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.not_activated', {
    url: "/teams/{slug}/not_activated",
    templateUrl: "salt/teams/not_activated.html",
    container: false,
    controller: function($rootScope, $stateParams, $scope, $sce) {
      $rootScope.title = "Not activated";

      $scope.team_www_url = window.BS_ENV.www_host + 'teams/' + $stateParams.slug;
    }
  });
});
