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
  })
  .directive('personIcon', function() {
    return {
      restrict: "E",
      scope: {
        person: "=",
        size: "@",
        format: "@"
      },
      templateUrl: "pages/issues/partials/person_icon.html",
      replace: true
    };
  })
  .directive('claimContent', function() {
    return {
      restrict: "E",
      scope: {
        claim: "=",
        issue: "="
      },
      templateUrl: "pages/issues/partials/claim_content.html",
      replace: true
    };
  });
