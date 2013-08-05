'use strict';

window.Mock = {
  init: function() {
    this.reset();
  },

  reset: function() {
    window.localStorage.clear();
  },

  push: function(path, method, params, data) {
    if (!(path && method && params && data)) { throw("Path, method, params, and data are required"); }
    var stubs = window.localStorage.getItem('stubs') ? window.localStorage.getItem('stubs').split(",") : [];
    stubs.push(path, method, JSON.stringify(params), JSON.stringify(data));
    window.localStorage.setItem('stubs', stubs);
  }
};
