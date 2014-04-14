'use strict';

angular.module('directives').directive('fundraiserEditForm', function($rootScope, $api) {
  return {
    restrict : 'EAC',
    templateUrl: 'common/directives/fundraiserEditForm/templates/fundraiserEditForm.html',
    scope: {
      fundraiser: "=",
      master: "=",
      team: "="
    },
    link: function(scope) {
      $rootScope.$watch('current_person', function(person) {
        if (person) {
          // Get person's teams
          $api.person_teams_get(person.id).then(function(teams) {
            scope.teams = angular.copy(teams);
            return scope.teams;
          });
        }
      });
    }
  };
});
