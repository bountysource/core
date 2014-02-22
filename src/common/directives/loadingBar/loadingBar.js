'use strict';

angular.module('app').directive('loadingBar', function() {
  return {
    restrict: "E",
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/loadingBar/templates/loadingBar.html'
  };
});