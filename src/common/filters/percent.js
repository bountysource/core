'use strict';

angular.module('app').filter('percent', function () {
  return function (input) {
    return Math.round(100 * input) + '%';
  };
});