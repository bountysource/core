'use strict';

angular.module('bountysource.directives').directive('loadingBar', function() {
  return {
    restrict: "E",
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/loadingBar/templates/loadingBar.html'
  };
});