angular.module('directives').directive('timeline', function ($window) {
  return {
    restrict: 'E',
    templateUrl: 'common/directives/timeline/timeline.html',
    scope: {
      events: '=',
      issue: '=timelineIssue',
      primaryClass: '@',
      dateInPrimary: '@',
      noActorImage: '@'
    },
    replace: true,
    link: function (scope, element, attrs) {
      if (!scope.primaryClass) {
        scope.primaryClass = 'primary-text';
      }
    }
  };
});
