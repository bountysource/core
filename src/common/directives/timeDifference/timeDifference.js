'use strict';

angular.module('directives').directive('timeDifference', function() {

  return {
    restrict: 'EAC',
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/timeDifference/templates/timeDifference.html',
    scope: { start: '&', end: '&' },
    link: function(scope) {
      var now = new Moment(scope.start() || undefined);
      var ends = new Moment(scope.end());
      var days_left = ends.diff(now, "days");
      var hours_left = ends.diff(now, "hours");
      var minutes_left = ends.diff(now, "minutes");
      var seconds_left = ends.diff(now, "seconds");

      if (days_left > 0) {
        scope.units = days_left;
        scope.word = "day";
      } else if (hours_left > 0) {
        scope.units = hours_left;
        scope.word = "hr";
      } else if (minutes_left > 0) {
        scope.units = minutes_left;
        scope.word = "min";
      } else {
        scope.units = Math.max(seconds_left, 0);
        scope.word = "sec";
      }
    }
  };

});
