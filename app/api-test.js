'use strict';

// Backend mockup

var appTest = angular.module("appTest", ['app', 'ngMockE2E']);

appTest.run(function ($rootScope, $httpBackend, $api, $window) {
  var all_dat = /.*/;
  $httpBackend.whenGET(all_dat).passThrough();
  $httpBackend.whenPOST(all_dat).passThrough();
  $httpBackend.whenPUT(all_dat).passThrough();
  $httpBackend.whenDELETE(all_dat).passThrough();

  // save the live API call method
  var old_call = $api.call;

  var make_live_call = true;

  $api.call = function() {
    // capture resolved promise, log route name and response data
    var args = Array.prototype.slice.call(arguments);
    var url = $rootScope.api_host + args.shift().replace(/^\//,'');
    var method = typeof(args[0]) === 'string' ? args.shift() : 'GET';
    var params = typeof(args[0]) === 'object' ? args.shift() : {};

    console.log('MOCK API CALL:', url, method, params);

    // invoke live API
    // var live_promise = old_call.apply(null, arguments);

    live_promise.then(function(data) {
      // $window.localStorage.setItem(route_name, JSON.stringify(data));
      console.log('MOCK API RESPONSE:', data);

      // TODO POST data to local server logging the data

    });

    return live_promise;
  };
});
