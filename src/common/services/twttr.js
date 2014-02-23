'use strict';

angular.module('services').service('$twttr', function ($window) {
  // Twitter script
  if (angular.isUndefined($window.twttr)) {
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
      if (!d.getElementById(id)) {
        js = d.createElement(s);
        js.id = id;
        js.src = p + "://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
      }
    })(document, "script", "twitter-wjs");
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
  this.widgets = {
    load: this.$$enqueue('widgets', 'load')
  };
  // poll until twitter sdk loaded
  var poll = $window.setInterval(function () {
    if (angular.isDefined($window.twttr)) {
      clearInterval(poll);
      // when twitter loads, copy all of it's attributes to this service
      for (var k in $window.twttr) {
        that[k] = angular.copy($window.twttr[k]);
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