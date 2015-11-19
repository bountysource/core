'use strict';

angular.module('filters').filter('round', function() {
  return function (input) {
    return Math.round(input);
  };
});