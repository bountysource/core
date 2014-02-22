'use strict';

angular.module('app').filter('round', function() {
  return function (input) {
    return Math.round(input);
  };
});