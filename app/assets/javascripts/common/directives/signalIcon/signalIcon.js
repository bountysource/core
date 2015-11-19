'use strict';
angular.module('directives').directive('signalIcon', function() {
  return {
    restrict: "E",
    templateUrl: "common/directives/signalIcon/signalIcon.html",
    replace: true,
    transclude: true,
    scope: {
      percent: "="
    }
  };
});
