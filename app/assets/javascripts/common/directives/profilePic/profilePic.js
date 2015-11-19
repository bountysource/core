'use strict';

angular.module('directives').directive('profilePic', function ($api) {
  return {
    restrict: "E",
    templateUrl: "common/directives/profilePic/profilePic.html",
    replace: true,
    scope: {
      owner: '=',
      size: '@',  // small medium large    [default small]
      width: '@'  // 25 50 responsive      [default responsive]
    },
    link: function (scope, element, attrs) {
      scope.$watch('owner', function (owner) {
        // resolve owner or default to anonymous
        scope.local_owner = scope.owner || $api.anonymous_owner_hash();

        // resolve link to an href
        scope.href = $api.owner_to_href(scope.local_owner);

        // size/quality of image (small / medium / large), bigger is more bandwidth
        if (scope.size && scope.size === 'small') {
        } else if (scope.size === 'medium') {
          scope.img_src = scope.local_owner.medium_image_url || scope.local_owner.image_url_medium || scope.local_owner.image_url;
        } else if (scope.size && scope.size === 'large') {
          scope.img_src = scope.local_owner.large_image_url || scope.local_owner.image_url_large || scope.local_owner.image_url;
        } else {
          scope.img_src = scope.local_owner.image_url || scope.local_owner.image_url_small;
        }
      });

      // TODO PERFORMANCE: generate the DOM elements via javascript rather than using angular HTML templates, also in profileName.js
    }
  };
});
