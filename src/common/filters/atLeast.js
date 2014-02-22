'use strict';

angular.module('app').filter('atLeast', function() {
  return function (input, other) {
    return (input > other) ? input : other;
  };
});