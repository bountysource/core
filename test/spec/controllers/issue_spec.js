/* jshint -W117 */
'use strict';

describe('Controller: Signin', function () {

  //var signin;
  var api;
  var scope;
  var routeparams;
  var httpMock;
  var createController;
  // var ctrl_service;

  var MOCKS = {
    forgot_password: {
      message: "ello ello",
      email_is_registered: true,
      error: "some error"
    },
    email_registered: {
      message: "ello ello",
      email_is_registered: true,
      error: "some error"
    },
    email_not_registered: {
      message: "ello ello",
      email_is_registered: false,
      error: "some error"
    },
    form_data: {
      email: "dan@dan.com",
      password: "dandan123",
      first_name: "dan_first",
      last_name: "dan_last",
      display_name: "dandan",
      terms: true
    }
  };
//  var HELPERS = {
//    promise: function (mock_data) {
//      return { then: function (fn) {
//        return fn(mock_data);
//      } };
//    },
//    createController: function (ctrl_id) {
//      return $controller(ctrl_id, { $scope: $rootScope });
//    }
//  };

  // Initialize the controller and a mock scope
  beforeEach(module('app'));

  beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $httpBackend) {
    scope = $rootScope.$new();
    api = $api;
    routeparams = $routeParams;
    httpMock = $httpBackend;
    // signin = $controller('Signin', {$scope: scope});
    // ctrl_service = $controller;
    createController = function () {
      return $controller('Signin', {'$scope': $rootScope });
    };
  }));

  it('should let me use httpBackend', function () {
    httpMock.expectJSONP('/signin').respond(function (method, url, data, headers) {
      console.log('Received these data:', method, url, data, headers);
    });
    //var ctrl = createController();
    scope.form_data = MOCKS.form_data;
//    scope.signin();
//    expect(scope.error).toEqual(MOCKS.email_not_registered.error);
//    httpMock.flush();
  });

});