'use strict';
/*
* Show currency value with correct unit.
* */
angular.module('filters').filter('dollars', function($filter) {
  return function(value, options) {
    return '$' + $filter('number')(value, 0);
  };
}).filter('encodeURIComponent', function($window) {
  return $window.encodeURIComponent;
}).filter('encodeEntities', function($sanitize) {
  // duplicated from https://github.com/angular/angular.js/blob/master/src/ngSa    console.log(val);
  return function(value) {
    var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;

    return value.
      replace(/&/g, '&amp;').
      replace(SURROGATE_PAIR_REGEXP, function(value) {
        var hi = value.charCodeAt(0);
        var low = value.charCodeAt(1);
        return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
      }).
      replace(NON_ALPHANUMERIC_REGEXP, function(value) {
        return '&#' + value.charCodeAt(0) + ';';
      }).
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;');
  };
});
