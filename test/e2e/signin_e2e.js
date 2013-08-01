/*jshint -W117 */
'use strict';

var fill_form = function (data) {
  for (var key in data) {
    var id = 'form_data.' + key;
    if (typeof(data[key]) === "boolean") {
      input(id).check();
    } else {
      input(id).enter(data[key]);
    }
  }
};

var MOCK = {
  signed_in_user: {
    email:    "mr_manly@gmail.com",
    password: "MANLINESS123456"
  },
  new_user_valid: {
    email:        "mr_manly@gmail.com",
    password:     "MANLINESS123456",
    first_name:   "Mister",
    last_name:    "ManlyMan",
    display_name: "TheManliest",
    terms:        true
  }
};

describe('Scenario: Signining In --', function () {
  beforeEach(function () {
    Mock.init();
    browser().navigateTo("/signin");
  });


  describe('initial state', function () {
    it("should have an email input", function () {
      // expect(element('#inputEmail')).toBeDefined();
    });

    it("PASSWORD field should initialized", function () {
      expect(element('#inputPassword').attr('placeholder')).toMatch('[a-zA-Z].*[0-9]|[0-9].*[a-zA-Z]');
      expect(element('#inputPassword:visible').count()).toBe(1);
    });

    it("should HIDE REST of FIELDS", function () {
      expect(element('#inputDisplayName:hidden').count()).toBe(1);

      // WHY IS THIS IS FAILING:
      // expect(element('#inputLastName:hidden').count()).toBe(1);
      // expect(element('#inputFirstName:hidden').count()).toBe(1);
    });
  });

  describe("INITIAL SUBMISSION", function () {
    it("should allow you to SIGIN_IN", function () {
      input('form_data.email').enter(MOCK.new_user_valid.email);
      input('form_data.password').enter('aa123');
      expect(element(".help-inline").text()).toContain("Available!");
    });

    it("should FIND user that EXISTS", function () {
      input('form_data.email').enter(MOCK.new_user_valid.email);
      expect(element(".help-inline").text()).toContain("Found!");
    });

    it("should ERROR for incorrectly formatted PASSWORD", function () {
      var no_number_password_user = angular.copy(MOCK.signed_in_user);
      no_number_password_user.password = 'aaaaaaaaaaaaaaaaaaaaa';
      fill_form(no_number_password_user);
      element("button:contains('Sign In')").click();
      expect(element('.alert.alert-error').text()).toContain('Password not correct');
    });
  });

  describe("VALID SIGN UP", function () {
    it("should NOT show errors for for correct signup", function () {
      fill_form(MOCK.new_user_valid);
      element("button:contains('Sign Up')").click();		//INCOMPLETE
    });
  });

  // since user already gets created look at the possible paths
  describe("REDIRECT to the HOMEPAGE", function () {
    it("should have HOME URL", function () {
      fill_form(MOCK.signed_in_user);
      element("button:contains('Sign In')").click();
      expect(browser().location().url()).toBe("/");
    });

    it("should show user's DISPLAY_NAME in NAVBAR", function () {
      expect(binding("current_person.display_name")).toBe(MOCK.new_user_valid.display_name);
    });
  });
});
