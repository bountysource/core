'use strict';

angular.module('directives').directive('ownerSelect', function ($api) {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/ownerSelect/templates/ownerSelect.html',
    replace: true,
    scope: { teams: '=' },
    link: function (scope) {

      scope.teams = $api.v2.teams;

    }
  };

});
