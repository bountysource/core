'use strict';

angular.module('services').service('$pageTitle', function($window) {
  this.set = function() {
    var value = arguments.length > 0 ? Array.prototype.slice.call(arguments,0) : arguments[0];
    var parts;
    if ((value === null) || (value === undefined) || (value === false)) {
      // no page title, do nothing
      parts = [ 'Bountysource' ];
    } else if (typeof(value) === 'string') {
      // string page title, append
      parts = [ value ];
    } else {
      // array page title, slice
      parts = value.slice(0);
    }
    $window.document.title = parts.join(' - ');
  };
});