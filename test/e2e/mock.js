/*jshint -W117 */
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
    if (!(path && method && params && response)) { throw("path, method, params and response required"); }

    var count = this.getCount() + 1;

    localStorage.setItem('path'+count, path);
    localStorage.setItem('method'+count, method);
    localStorage.setItem('params'+count, JSON.stringify(params));
    localStorage.setItem('response'+count, JSON.stringify(response));

    // increment count
    this.setCount(count);
  },

  pushScenario: function(path, method, scenario) {
    var response = RESPONSE_MOCK[path][method][scenario];
    if (!response) {
      var errorMessage = "check RESPONSE_MOCK, scenario " + [path, method, scenario].join(" - ") + " does not exist";
      console.log(errorMessage);
      throw(errorMessage);
    }

    var count = this.getCount() + 1;

    localStorage.setItem('response'+count, JSON.stringify(response));
    localStorage.setItem('responseInfo'+count, [path, method, scenario].join(" - "));

    // increment count
    this.setCount(count);
  }

};



