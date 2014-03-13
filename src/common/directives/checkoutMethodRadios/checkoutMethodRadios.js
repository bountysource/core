'use strict';

angular.module('directives').directive('checkoutMethodRadios', function($api) {
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
          });
        }
      });
    }
  };
});