'use strict';

angular.module('bountysource.directives').directive('requireTwitter', ['$twttr', function($twttr) {
  return {
    restrict: "A",
    scope: "isolate",
    link: function() { $twttr.widgets.load(); }
  };
}]);