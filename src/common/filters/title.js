'use strict';

angular.module('filters').filter('title', function() {
  // Capitalize all words
  return function(s) {
    var parts = s.split(" ");
    var new_parts = [];
    for (var i=0; i<parts.length; i++) { new_parts.push(parts[i][0].toUpperCase() + parts[i].slice(1)); }
    return new_parts.join(" ");
  };
});