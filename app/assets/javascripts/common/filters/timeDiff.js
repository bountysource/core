'use strict';

angular.module('filters').filter('timeDiff', function() {
  return function(date, options) {
    options = options || {};
    var now = moment();
    var ends = moment(date);
    if (ends < now) {
      var tmp = now;
      now = ends;
      ends = tmp;
    }
    var years_left = ends.diff(now, "years");
    var months_left = ends.diff(now, "months");
    var days_left = ends.diff(now, "days");
    var hours_left = ends.diff(now, "hours");
    var minutes_left = ends.diff(now, "minutes");
    var seconds_left = ends.diff(now, "seconds");
    var time_left, time_left_unit;
    if (years_left > 0) {
      time_left = years_left;
      time_left_unit = "year";
    } else if (months_left > 0) {
      time_left = months_left;
      time_left_unit = "month";
    } else if (days_left > 0) {
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
    if (time_left !== 1) { time_left_unit += "s"; }
    return time_left + " " + time_left_unit;
  };
});
