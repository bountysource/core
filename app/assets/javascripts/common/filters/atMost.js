'use strict';

angular.module('filters').filter('atMost', function() {
  return function (input, other) {
    return (input < other) ? input : other;
  };
});