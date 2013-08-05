'use strict';

window.Mock = {
  init: function() {
    this.reset();
  },

  reset: function() {
    window.localStorage.clear();
    localStorage.setItem('stubsCount', 0);
  },

  getCount: function() {
    return parseInt(localStorage.getItem('stubsCount'), 10);
  },

  setCount: function(n) {
    localStorage.setItem('stubsCount', n);
  },

  push: function(path, method, params, data) {
    if (!(path && method && params && data)) { throw("Path, method, params, and data are required"); }
    var count = this.getCount() + 1;

    localStorage.setItem('path'+count, path);
    localStorage.setItem('method'+count, method);
    localStorage.setItem('params'+count, JSON.stringify(params));
    localStorage.setItem('data'+count, JSON.stringify(data));

    // increment count
    this.setCount(count);
  }
};
