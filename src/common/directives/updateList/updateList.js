'use strict';

angular.module('directives').directive('updateList', function() {
  return {
    restrict: "E",
    templateUrl: "common/directives/updateList/templates/updateList.html",
    scope: {
      updates: "=",
      team: "=",

      // Optional columns to include
      include:       "=",
      setParams: "&"
    },
    link: function(scope, element, attrs) {
    }
  };
});
