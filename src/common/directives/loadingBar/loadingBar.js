'use strict';

angular.module('directives').directive('loadingBar', function() {
  return {
    restrict: "E",
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/loadingBar/templates/loadingBar.html'
  };
});