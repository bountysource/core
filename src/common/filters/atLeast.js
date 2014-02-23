'use strict';

angular.module('filters').filter('atLeast', function() {
  return function (input, other) {
    return (input > other) ? input : other;
  };
});