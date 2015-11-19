'use strict';
/*
 * truncate string, add '...' or custom text.
 * note, size is the EXACT length of the string returned,
 * which factors in the length of replacement.
 *
 * $scope.text = "Apples are delicious"
 * <span>{{ text | truncate:12 }}</span> ==> <span>Apples ar...</span>
* */
angular.module('filters').filter('truncate', function() {
  return function(s, size, replacement) {
    size = size || 50;
    replacement = replacement || "...";
    if (!s || s.length <= size) {
      return s;
    }
    return s.slice(0,size+replacement.length) + replacement;
  };
});