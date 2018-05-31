angular.module('directives').directive('teamAboutPanel', function($rootScope, $location, $route, $routeParams, $api, $analytics, $modal, $window, Tag) {
  return {
    restrict: 'EAC',
    replace: true,
    transclude: true,
    templateUrl: 'app/directives/issues/teamAboutPanel/teamAboutPanel.html',
    link: function(scope) {
      // Load backers after Team is ready
      scope.$watch('team', function(team) {
        if (team) {
          $api.v2.backers({
            team_id: team.id,
            per_page: 10,
            order: '+amount'
          }).then(function(response) {
            scope.topBackers = angular.copy(response.data);
          });
        }
      })

      scope.bountyHunterOptIn = function() {
        if ($rootScope.current_person) {
          $api.people.update({ id: $rootScope.current_person.id, bounty_hunter_opt_in_team: scope.team.slug }, $route.reload);
        } else {
          $api.require_signin();
        }
      };

      scope.bountyHunterOptOut = function() {
        if ($rootScope.current_person) {
          $api.people.update({ id: $rootScope.current_person.id, bounty_hunter_opt_out_team: scope.team.slug }, $route.reload);
        } else {
          $api.require_signin();
        }
      };
    }
  };
});
