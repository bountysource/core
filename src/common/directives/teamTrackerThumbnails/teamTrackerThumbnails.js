'use strict';

angular.module('app').directive('teamTrackerThumbnails', function() {
  return {
    restrict: "E",
    templateUrl: 'common/directives/teamTrackerThumbnails/templates/teamTrackerThumbnails.html',
    scope: {
      trackers: "="
    }
  };
});