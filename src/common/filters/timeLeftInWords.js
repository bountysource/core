'use strict';

angular.module('filters').filter('timeLeftInWords', function() {
  return function(date) {
    var now = new Moment();
    var ends = new Moment(date);
    var days_left = ends.diff(now, "days");
    var hours_left = ends.diff(now, "hours");
    var minutes_left = ends.diff(now, "minutes");
    var seconds_left = ends.diff(now, "seconds");
    var time_left, time_left_unit;
    if (days_left > 0) {
      time_left = days_left;
      time_left_unit = "day";
    } else if (hours_left > 0) {
      time_left = hours_left;
      time_left_unit = "hour";
    } else if (minutes_left > 0) {
      time_left = minutes_left;
      time_left_unit = "minute";
    } else {
      time_left = Math.max(seconds_left, 0);
      time_left_unit = "second";
    }
    // pluralize the unit if necessary
    if (time_left !== 1) { time_left_unit += "s"; }
    return time_left + " " + time_left_unit;
  };
});