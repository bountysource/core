'use strict';

angular.module('directives').directive('requireTwitter', function($twttr) {
  return {
    restrict: "A",
    scope: "isolate",
    link: function() { $twttr.widgets.load(); }
  };
});