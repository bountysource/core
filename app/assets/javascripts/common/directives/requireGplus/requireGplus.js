'use strict';

angular.module('directives').directive('requireGplus', function($gplus) {
  return {
    restrict: "A",
    scope: "isolate",
    link: function() { $gplus.plusone.go(); } // $gplus.widgets.load();
  };
});