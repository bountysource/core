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
  });

