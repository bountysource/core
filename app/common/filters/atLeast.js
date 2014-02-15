'use strict';

angular.module('bountysource.filters').filter('atLeast', [function() {
  return function (input, other) {
    return (input > other) ? input : other;
  };
}]);