'use strict';

angular.module('app').
  filter('percent', function () {
    return function (input) {
      return Math.round(100 * input) + '%';
    };
  }).filter('dollars', function ($filter) {
    var currency = $filter('currency');
    return function(input, options) {
      options = options || {};
      return currency(input, (options.space ? '$ ' : '$')).replace(/\.\d\d$/,'');
    };
  }).filter('round', function () {
    return function (input) {
      return Math.round(input);
    };
  }).filter('at_least', function () {
    return function (input, other) {
      return (input > other) ? input : other;
    };
  }).filter('at_most', function () {
    return function (input, other) {
      return (input < other) ? input : other;
    };
  }).filter('slice', function() {
    return function(a,start,end) {
      if (!a) { return []; }
      return a.slice(start,end);
    };
  }).filter('truncate', function() {
    // truncate string, add '...' or custom text.
    // note, size is the EXACT length of the string returned,
    // which factors in the length of replacement.
    //
    // $scope.text = "Apples are delicious"
    // <span>{{ text | truncate:12 }}</span> ==> <span>Apples ar...</span>
    return function(s, size, replacement) {
      size = size || 50;
      replacement = replacement || "...";
      if (!s || s.length <= size) {
        return s;
      }
      return s.slice(0,size+replacement.length) + replacement;
    };
  }).filter('clean_url', function() {
    return function(s) {
      var new_url = (s||"").replace(/https?:\/\//, '');
      new_url = new_url.replace(/\/$/, '');
      return new_url;
    };
  }).filter('from_snake_case', function() {
    // Convert snakecase to words
    return function(s) {
      var parts = s.replace(/[_-]/g, " ").split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0] + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  }).filter('title', function() {
    // Capitalize all words
    return function(s) {
      var parts = s.split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0].toUpperCase() + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  }).filter('pluralize', function() {
    // add 's' to string if num is not 1
    return function(s,num) {
      if (s[s.length - 1] === 'y') {
        return s.slice(0, s.length-1) + (num !== 1 ? 'ies' : 'y');
      } else {
        return s + (num !== 1 ? 's' : '');
      }
    };
  }).filter('fundraiser_status', function() {
    return function(fundraiser) {
      if (!fundraiser) { return ""; }
      if (!fundraiser.published) { return "draft"; }
      else if (fundraiser.published && fundraiser.in_progress) { return "published"; }
      else if (!fundraiser.in_progress) { return "completed"; }
      else { return ""; }
    };
  }).filter('time_left_in_words', function() {
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
  }).filter('time_ago_short', function() {
    return function(date, options) {
      options = options || {};
      var now = new Moment();
      var ends = new Moment(date);
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
      } else {
        time_left = days_left;
        time_left_unit = "d";
      }
      return time_left + ' ' + time_left_unit;
    };
  }).filter('slug', function() {
    return function(val) {
      return (val||"").toLowerCase().replace(/[ ]+/g,'-').replace(/[,.]/g,'').replace(/-(inc|llc)$/,'').replace(/[^a-z0-9-_]/g,'');
    };
  }).filter('pluck', function() {
    return function(input, field) {
      // console.log(arguments);
      var retval = [];
      for (var i=0; i < input.length; i++) {
        retval.push(input[i][field]);
      }
      return retval;
    };
  }).filter('unique', function() {
    return function(input) {
      var retval = [];
      for (var i=0; i < input.length; i++) {
        if (retval.indexOf(input[i]) === -1) {
          retval.push(input[i]);
        }
      }
      return retval;
    };
  }).filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        if (a[field] > b[field]) {
          return 1;
        }
        if (a[field] < b[field]) {
          return -1;
        }
        return 0;
      });
      if (reverse) {
        filtered.reverse();
      }
      return filtered;
    };
  }).filter('hex', function() {
    return function(input) {
      if (input) {
        return input.replace(/[^0-9a-f]/i, "");
      }
    };
  }).filter('encodeUriQuery', function() {
    return function(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    };
  });


