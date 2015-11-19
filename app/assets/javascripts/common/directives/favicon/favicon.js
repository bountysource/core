'use strict';

angular.module('directives').directive('favicon', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'common/directives/favicon/favicon.html',
    scope: {
      domain: "@"
    }
  };
});