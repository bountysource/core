'use strict';

angular.module('app').
  directive('backerThumbnails', function() {
    return {
      restrict: "E",
      scope: {
        issue: "="
      },
      templateUrl: "pages/issues/partials/backer_thumbnails.html",
      replace: true
    };
  });
