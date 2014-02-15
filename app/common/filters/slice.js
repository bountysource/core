'use strict';

angular.module('bountysource.filters').filter('slice', [function() {
  return function(a,start,end) {
    if (!a) { return []; }
    return a.slice(start,end);
  };
}]);