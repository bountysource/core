'use strict';

angular.module('app').filter('atMost', function() {
  return function (input, other) {
    return (input < other) ? input : other;
  };
});