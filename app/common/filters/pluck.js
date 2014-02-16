'use strict';

angular.module('bountysource.filters').filter('pluck', function() {
  return function(input, field) {
    // console.log(arguments);
    var retval = [];
    for (var i=0; i < input.length; i++) {
      retval.push(input[i][field]);
    }
    return retval;
  };
});