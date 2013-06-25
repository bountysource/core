'use strict';

angular.module('app').
  filter('percent', function () {
    return function (input) {
      return Math.round(100 * input) + '%';
    };
  }).filter('dollars', function ($filter) {
    var currency = $filter('currency');
    return function(input) {
      return currency(input, '$').replace(/\.\d\d$/,'');
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
  // Convert snakecase to words
  }).filter('from_snake_case', function() {
    return function(s) {
      var parts = s.replace(/[_-]/g, " ").split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0] + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  }).filter('title', function() {
    return function(s) {
      var parts = s.split(" ");
      var new_parts = [];
      for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0].toUpperCase() + parts[i].slice(1)); }
      return new_parts.join(" ");
    };
  });

