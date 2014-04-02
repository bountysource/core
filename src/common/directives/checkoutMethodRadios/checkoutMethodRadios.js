'use strict';

angular.module('directives').directive('checkoutMethodRadios', function($api, $location) {
  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/checkoutMethodRadios/templates/checkoutMethodRadios.html',
    replace: true,
    scope: {
      value: '=',
      person: '='
    },
    link: function(scope) {
      // Fetch teams for person to load Team accounts
      scope.$watch('person', function(person) {
        if (person) {
          $api.person_teams_get(person.id).then(function(teams) {
            scope.teams = angular.copy(teams);
            // check if we are already on the team accoutn page. Don't want people funding their team from their OWN team account
          });
        }
      });

      scope.onTeamPage = function (team) {
        var matches = ($location.path()).match( /^\/teams\/([a-z-_0-9]+)\/account$/ );
        if (matches) {
          return team.slug === matches[1];
        }
      };
    }
  };
});
