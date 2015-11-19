'use strict';

angular.module('filters').filter('unique', function() {
  return function(input) {
    var retval = [];
    for (var i=0; i < input.length; i++) {
      if (retval.indexOf(input[i]) === -1) {
        retval.push(input[i]);
      }
    }
    return retval;
  };
});