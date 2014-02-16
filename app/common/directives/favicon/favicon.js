'use strict';

angular.module('bountysource.directives').directive('favicon', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'common/directives/favicon/templates/favicon.html',
    scope: {
      domain: "@"
    }
  };
});