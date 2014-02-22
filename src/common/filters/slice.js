'use strict';

angular.module('app').filter('slice', function() {
  return function(a,start,end) {
    if (!a) { return []; }
    return a.slice(start,end);
  };
});