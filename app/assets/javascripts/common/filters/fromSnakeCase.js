'use strict';

angular.module('filters').filter('fromSnakeCase', function() {
  // Convert snakecase to words
  return function(s) {
    var parts = s.replace(/[_-]/g, " ").split(" ");
    var new_parts = [];
    for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0] + parts[i].slice(1)); }
    return new_parts.join(" ");
  };
});