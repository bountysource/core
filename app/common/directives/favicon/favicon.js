'use strict';

angular.module('app.directives').directive('favicon', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'common/directives/favicon/templates/favicon.html',
    scope: {
      domain: "@"
    }
  };
});