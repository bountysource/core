'use strict';

var appTest = angular.module("appTest", ['app', 'ngMockE2E']);

appTest.run(function($rootScope, $httpBackend, $api, $window, $q) {

  var request_regex = /.*/;
  $httpBackend.whenGET(request_regex).passThrough();
  $httpBackend.whenPOST(request_regex).passThrough();
  $httpBackend.whenPUT(request_regex).passThrough();
  $httpBackend.whenDELETE(request_regex).passThrough();

});
