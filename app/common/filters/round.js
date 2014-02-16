'use strict';

angular.module('bountysource.filters').filter('round', function() {
  return function (input) {
    return Math.round(input);
  };
});