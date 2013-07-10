/* jshint -W117 */
'use strict';

describe('Controller: Signin', function () {

  var signin;
  var api;
  var scope;
  var routeparams;

  // create helper that returns a function that responds to then
  // then takes in a function(x) and executes it with data
  var HELPERS = {
    promise: function (mock_data) {
      return { then: function (fn) {
        return fn(mock_data);
      } };
    }
  };
  var MOCKS = {
    forgot_password: {
      message: "Password forgotten",
      email_is_registered: true,
      error: "some error"
    },
    email_registered: {
      message: "Email is registered",
      email_is_registered: true,
      error: "some error"
    },
    email_not_registered: {
      message: "Email Available",
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

  // Initialize the controller and a mock scope
  beforeEach(module('app'));

  beforeEach(inject(function ($controller, $rootScope, $routeParams, $api) {
    scope = $rootScope.$new();
    api = $api;
    routeparams = $routeParams;
    signin = $controller('Signin', {$scope: scope, $routeParams: routeparams, $api: api });
  }));


  describe('STATIC PROVIDERS', function () {
    it('should include three providers', function () {
      expect(scope.providers.length).toBe(3);
    });
    it('should contain github, twitter, facebook', function () {
      var provider_list = scope.providers;
      var id_list = [];   // do suboptimal test
      for (var i = 0; i < provider_list.length; i++) {
        id_list.push(provider_list[i].id);
      }

      expect(id_list).toContain('github');
      expect(id_list).toContain('twitter');
      expect(id_list).toContain('facebook');
    });
  });

  describe('INTIAL STATES', function () {
    it('should ASSIGN from API signout', function () {
      expect(api.signin_url_for).toEqual(scope.signin_url_for);
      expect(scope.signout).toEqual(api.signout);
    });
    it("should EMAIL_CHANGING is undefined", function () {
      expect(scope.email_changing).toBeDefined();
    });
    it("should be able to call email_changing", function () {
      expect(scope.email_changing()).not.toBeDefined(); //not return statement
    });
    it("should initialize signin_or_signup to null", function () {
      expect(scope.signin_or_signup).toBeNull();
    });
    it("should initialize show_validations to false", function () {
      expect(scope.show_validations).toBeFalsy();
    });
  });

  describe('FORGOT PASSWORD', function () {
    it('should request passowrd THROUGH forgot_password', function () {
      spyOn(api, 'request_password_reset').andReturn(HELPERS.promise(MOCKS.forgot_password));
      scope.forgot_password();
      expect(api.request_password_reset).toHaveBeenCalled();
      expect(scope.error).toEqual(MOCKS.forgot_password.message);
    });
  });

  describe('SIGNIN', function () {
    describe('INITIALLY', function () {
      it('should first display not validations', function () {
        expect(scope.show_validations).toBeFalsy();
      });
      it("should NOT have errors defined", function () {
        expect(scope.error).not.toBeDefined();
      });
      it("should have signin state should be null", function () {
        expect(scope.signin_or_signup).toBeNull();
      });
      it('should NOT change values when PENDING in the initial state', function () {
        scope.signin_or_signup = 'pending';
        scope.signin();
        expect(scope.show_validations).toBeFalsy();
        expect(scope.error).not.toBeDefined();
      });
    });

    describe('when NOT PENDING', function () {
      it("should have some form_data", function () {
        expect(scope.form_data).toBeDefined();
      });
      it("should send REQUEST WHEN response is SIGN IN", function () {
        scope.form_data = MOCKS.form_data;
        spyOn(api, 'signin').andReturn(HELPERS.promise(MOCKS.email_registered));

        scope.signin();

        expect(api.signin).toHaveBeenCalledWith(MOCKS.form_data);
        expect(scope.error).toEqual(MOCKS.email_registered.error);
      });
      it("should send REQUEST WHEN response is SIGN UP", function () {
        scope.form_data = MOCKS.form_data;
        spyOn(api,'signup').andReturn(HELPERS.promise(MOCKS.email_not_registered));

        scope.signup();

        expect(api.signup).toHaveBeenCalledWith(MOCKS.form_data);
        expect(scope.error).toEqual(MOCKS.email_not_registered.error);
      });
    });
  });

  describe('EMAIL CHANGED', function () {
    it("should send REQUEST WHEN response is SIGNEDUP", function () {
      scope.form_data = MOCKS.form_data;  // SETUP
      scope.signin_or_signup = 'pending';
      spyOn(api,'check_email_address').andReturn(HELPERS.promise(MOCKS.email_not_registered));

      scope.email_changed();  // RUN

      expect(api.check_email_address).toHaveBeenCalledWith(scope.form_data.email); // VERIFY
      expect(scope.signin_or_signup).toEqual('signup');
    });
    it("should send REQUEST WHEN response is SIGNIN", function () {
      scope.form_data = MOCKS.form_data;  //SETUP
      scope.signin_or_signup = 'pending';
      spyOn(api,'check_email_address').andReturn(HELPERS.promise(MOCKS.email_registered));

      scope.email_changed();  // RUN

      expect(api.check_email_address).toHaveBeenCalledWith(scope.form_data.email);  // VERIFY
      expect(scope.signin_or_signup).toEqual('signin');
    });
    it("should do NOTHING if email has NOT changed", function () {
      var mock_email = 'mock@mock.com';
      MOCKS.form_data.email = mock_email;
      scope.email_previous = mock_email;
      scope.form_data = MOCKS.form_data;
      var previous_signup_or_signin = 'something_random';
      scope.signin_or_signup = previous_signup_or_signin;

      scope.email_changed();

      var next_signin_or_signup = scope.signin_or_signup;
      expect(previous_signup_or_signin).toEqual(next_signin_or_signup);
    });
  });

});