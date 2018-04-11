angular.module('filters').filter('timeAgoShort', function() {
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
    var time_left, time_left_unit;
    if (years_left > 0) {
      time_left = years_left;
      time_left_unit = "yr";
    } else if (months_left > 0) {
      time_left = months_left;
      time_left_unit = "mo";
    } else if (days_left > 0) {
      time_left = days_left;
      time_left_unit = "d";
    } else {
      time_left = 0;
      time_left_unit = "d";
    }
    return time_left + ' ' + time_left_unit;
  };
});
