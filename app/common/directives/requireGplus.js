'use strict';

angular.module('app.directives').directive('requireGplus', ['$gplus', function($gplus) {
  return {
    restrict: "A",
    scope: "isolate",
    link: function() { $gplus.plusone.go(); } // $gplus.widgets.load();
  };
}]);