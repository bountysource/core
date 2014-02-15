'use strict';

angular.module('bountysource.directives').directive('requireGplus', ['$gplus', function($gplus) {
  return {
    restrict: "A",
    scope: "isolate",
    link: function() { $gplus.plusone.go(); } // $gplus.widgets.load();
  };
}]);