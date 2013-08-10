'use strict';

var appTest = angular.module("appTest", ['app', 'ngMockE2E']);

appTest.run(function($rootScope, $httpBackend, $api, $window, $q) {
  // $httpBackend.when("GET", "https://api-qa.bountysource.com/user?access_token=18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc&callback=CORS&per_page=250" ).respond({"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
  // $httpBackend.when("GET", "https://api-qa.bountysource.com/user?access_token=18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc&callback=CORS&per_page=250" ).respond({"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
  // $httpBackend.when("GET", "https://api-qa.bountysource.com/user?access_token=18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc&callback=CORS&per_page=250" ).respond({"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
  // $httpBackend.when("GET", "https://api-qa.bountysource.com/user?access_token=18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc&callback=CORS&per_page=250" ).respond({"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});

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
