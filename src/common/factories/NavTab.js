'use strict';

angular.module('factories').factory('NavTab', function($location, $log) {

  return function(name, urls, resolver) {
    this.name = name;
    this.urls = angular.isArray(urls) ? urls : [urls];
    this._show = true;

    var self = this;

    if (angular.isDefined(resolver)) {
      this._show = false;
      resolver.then(function(show) {
        self._show = show;
      });
    }

    this.active = function() {
      var path  = $location.path();
      var url, value;
      for (var i=0; i<self.urls.length; i++) {
        url = self.urls[i];
        if (url instanceof RegExp) {
          value = url.test(path);
        } else if (angular.isString(url)) {
          value = url === path;
        } else {
          $log.warn('NavTab: invalid url matcher', url, this);
        }
        if (value) { return true; }
      }
      return false;
    };

    this.href = function() {
      return this.urls[0];
    };

    this.visible = function() {
      return this._show;
    };
  };

});