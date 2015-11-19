'use strict';

angular.module('directives').directive('activityTimeline', function () {
  return {
    restrict: 'E',
    templateUrl: 'common/directives/activityTimeline/activityTimeline.html',
    scope: {
      timeline: "="
    }
  };
});
