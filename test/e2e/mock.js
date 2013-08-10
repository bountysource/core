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

  push: function(path, method, params, response) {
    if (!(path && method && params && response)) { throw("Path, method, params, and response are required"); }
    var count = this.getCount() + 1;

    localStorage.setItem('path'+count, path);
    localStorage.setItem('method'+count, method);
    localStorage.setItem('params'+count, JSON.stringify(params));
    localStorage.setItem('response'+count, JSON.stringify(response));

    // increment count
    this.setCount(count);
  }
};



