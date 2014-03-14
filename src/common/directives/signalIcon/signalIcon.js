'use strict';
angular.module('directives').directive('signalIcon', function() {
  return {
    restrict: "E",
    templateUrl: "common/directives/signalIcon/templates/signalIcon.html",
    replace: true,
    transclude: true,
    scope: {
      percent: "="
    }
  };
});
