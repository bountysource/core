'use strict';

angular.module('app.directives').directive('requireTwitter', ['$twttr', function($twttr) {
  return {
    restrict: "A",
    scope: "isolate",
    link: function() { $twttr.widgets.load(); }
  };
}]);