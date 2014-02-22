'use strict';

angular.module('app').directive('requireTwitter', function($twttr) {
  return {
    restrict: "A",
    scope: "isolate",
    link: function() { $twttr.widgets.load(); }
  };
});