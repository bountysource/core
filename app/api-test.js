'use strict';

var appTest = angular.module("appTest", ['app', 'ngMockE2E']);

appTest.run(function($rootScope, $httpBackend, $api, $window, $q) {
  $httpBackend.whenPOST("/payments", "POST").respond("called google wallet");
  var request_regex = /.*/;
  $httpBackend.whenGET(request_regex).passThrough();
  $httpBackend.whenPOST(request_regex).passThrough();
  $httpBackend.whenPUT(request_regex).passThrough();
  $httpBackend.whenDELETE(request_regex).passThrough();

  
  // $api.call = function() {
  //   // capture resolved promise, log route name and response data
  //   var args = Array.prototype.slice.call(arguments);
  //   var request = {
  //     path: args.shift(),
  //     method: typeof(args[0]) === 'string' ? args.shift() : 'GET',
  //     params: typeof(args[0]) === 'object' ? args.shift() : {},
  //     callback: typeof(args[0]) === 'function' ? args.shift() : function(response) { return response.data;}
  //   };

  //   console.log("Request", request);
  //   var mock_response = $api.$shift_mock_response();

  //   console.log("Mock response:", mock_response);
  //   request.callback(mock_response);

  //   var deferred = $q.defer();
  //   deferred.resolve(request.callback(mock_response));
  //   return deferred.promise;

  //   throw('LIVE API CALL:', path, method, params);
  // };

  
  // $api.$shift_mock_response = function() {
  //   var count = parseInt(window.localStorage.getItem('stubsCount'), 10);
  //   if (count > 0) {
  //     // decrement count
  //     window.localStorage.setItem('stubsCount', count - 1);
  //     return JSON.parse(localStorage.getItem('response'+count));
  //   } else {
  //     throw("Nothing left :/");
  //   }
  // };  
});

// appTest.constant('$person', {});
// appTest.run(function ($rootScope, $httpBackend, $api, $window, $q) {
//   var request_regex = /.*/;
//   $httpBackend.whenGET(request_regex).passThrough();
//   $httpBackend.whenPOST(request_regex).passThrough();
//   $httpBackend.whenPUT(request_regex).passThrough();
//   $httpBackend.whenDELETE(request_regex).passThrough();

//   // kill the live API
//   $api.call = function() {
//     // capture resolved promise, log route name and response data
//     var args = Array.prototype.slice.call(arguments);
//     var request = {
//       path: args.shift(),
//       method: typeof(args[0]) === 'string' ? args.shift() : 'GET',
//       params: typeof(args[0]) === 'object' ? args.shift() : {},
//       callback: typeof(args[0]) === 'function' ? args.shift() : function(response) { return response.data;}
//     };

// //    // build stubs from localStorage.
// //    // a stub is comprised of 4 elements on the array
// //    var stub_parts = (window.localStorage.getItem('stubs') || "").split(",");
// //    for (var i=0; i<stub_parts.length; i++) {
// //      var path  = stub_parts.shift(),
// //        method  = stub_parts.shift(),
// //        params  = JSON.parse(stub_parts.shift()),
// //        data    = JSON.parse(stub_parts.shift());
// //
// //      if (request.path === path && request.method === method) {
// //        var deferred = $q.defer();
// //        deferred.resolve(data);
// //        return deferred.promise;
// //      }
// //    }

//     console.log("Request", request);
//     var mock_response = $api.$shift_mock_response();
//     request.callback(mock_response);

//     var deferred = $q.defer();
//     deferred.resolve(request.callback(mock_response));
//     return deferred.promise;

//     throw('LIVE API CALL:', path, method, params);
//   };

//   $api.$shift_mock_response = function() {
//     var count = parseInt(window.localStorage.getItem('stubsCount'), 10);
//     if (count > 0) {
//       // decrement count
//       window.localStorage.setItem('stubsCount', count - 1);

//       return JSON.parse(localStorage.getItem('response'+count));

//     } else {
//       throw("Nothing left :/");
//     }
//   }

// });
