'use strict';

angular.module('bountysource.filters').filter('percent', function () {
  return function (input) {
    return Math.round(100 * input) + '%';
  };
});