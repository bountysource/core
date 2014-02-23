'use strict';

angular.module('services').service('$gplus', function ($window) {
  if (angular.isUndefined($window.gapi)) {
    (function () {
      var po = document.createElement('script');
      po.type = 'text/javascript';
      po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
    })();
  }
  var that = this;
  this.$$queue = [];
  this.$$enqueue = function () {
    var method = arguments;
    return function () {
      var args = arguments;
      that.$$queue.push([method, args]);
    };
  };
  // stub widgets with method to enqueue requests while
  // the sdk loads
  this.plusone = {
    go: this.$$enqueue('plusone', 'go')
  };
  // poll until twitter sdk loaded
  var poll = $window.setInterval(function () {
    if (angular.isDefined($window.gapi)) {
      clearInterval(poll);
      // when twitter loads, copy all of it's attributes to this service
      for (var k in $window.gapi) {
        that[k] = $window.gapi[k];
      }
      // pop off queued sdk invocations
      while (that.$$queue.length > 0) {
        var msg = that.$$queue.shift();
        var method;
        for (var i = 0; i < msg[0].length; i++) {
          method = (method ? method[msg[0][i]] : that[msg[0][i]]);
        }
        method.apply(msg[1]);
      }
    }
  }, 5);
});