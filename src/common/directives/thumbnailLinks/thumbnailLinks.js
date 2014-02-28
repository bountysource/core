'use strict';

/*
  /// Purpose ///
  Creates rows of thumbnail links from an array of objects
  that have image_urls.

  /// Requirements ///
  Objects require these attributes for proper rendering:
  1. item.frontend_path
  2. item.name
  3. item.image_url

  /// Arguments ///
  array   => An array of objects that have image_url attributes.
  per_row => Number of thumbnail links per row.
*/

angular.module('directives').directive('thumbnailLinks', function () {
  return {
    restrict: 'EA',
    templateUrl: 'common/directives/thumbnailLinks/templates/thumbnailLinks.html',
    scope: {
      array: '=',
      perRow: '='
    },
    replace: true,
    link: function (scope) {

      scope.$watch('array', function (array) {
        console.log("array", array);
        if(array == undefined) {return};

        scope.range = function() {
          var range = [];
          for(var i = 0; i < scope.array.length; i = i + scope.perRow) {
            range.push(i);
          }
          return range;
        };
      })

    }

  };
});
