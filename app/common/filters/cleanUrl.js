'use strict';

angular.module('bountysource.filters').filter('cleanUrl', [function() {
  return function(s) {
    var new_url = (s||"").replace(/https?:\/\//, '');
    new_url = new_url.replace(/\/$/, '');
    return new_url;
  };
}]);