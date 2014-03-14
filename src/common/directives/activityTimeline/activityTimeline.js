'use strict';

angular.module('directives').directive('activityTimeline', function () {
  return {
    restrict: 'EA',
    templateUrl: 'common/directives/activityTimeline/templates/activityTimeline.html',
    scope: {
      timeline: "="
    }
  };
});
