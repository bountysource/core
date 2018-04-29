angular.module('directives').directive('timelineSmall', function ($window) {
  return {
    restrict: 'E',
    templateUrl: 'common/directives/timeline/timelineSmall.html',
    scope: {
      events: '=',
    },
    replace: true
  };
});
