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
  existing_user: {
    email:        "mr_manly@gmail.com",
    password:     "MANLINESS123456",
    first_name:   "Mister",
    last_name:    "ManlyMan",
    display_name: "TheManliest",
    terms:        true
  },

  new_account_valid: {
    email: "sample@test.com",
    password: "password1",
    first_name: "Test",
    last_name: "McTest",
    display_name: "TestMcTest",
    terms: true
  }
};

describe('Scenario: Signining In --', function () {
  beforeEach(function () {
    browser().navigateTo('/signin');
    Mock.init();
  });

  describe("INITIAL SUBMISSION", function () {
    it("should allow new user to create account", function () {
      Mock.push("/user/login", "POST", {"email": MOCK.new_account_valid.email}, {"error":"Email address not found.","email_is_registered":false});
      fill_form(MOCK.new_account_valid);
      using('form[name=form]').element("input[name=email]").query(function(element, done) {
        var evt = document.createEvent("Event");
        evt.initEvent('blur', false, true);
        element[0].dispatchEvent(evt);
        done();
      });
      pause();
      expect(element(".help-inline:visible").html()).toEqual("<small>Available!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign Up");

      //need to mock out clicking sign up
    });

    it("should FIND user that EXISTS", function () {
      Mock.push("/user/login", "POST", {"email": MOCK.existing_user.email}, {"error":"Password not correct.","email_is_registered":true});
      input('form_data.email').enter(MOCK.existing_user.email);
      using('form[name=form]').element("input[name=email]").query(function(element, done) {
        var evt = document.createEvent("Event");
        evt.initEvent('blur', false, true);
        element[0].dispatchEvent(evt);
        done();
      });
      pause();
      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
    });

  //   it("should ERROR for incorrect PASSWORD on existing account", function () {
  //     Mock.push("/user/login", "POST", {"email":"mr_manly@gmail.com","password":"badpassword1"}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404,"success":false,"pagination":null}});
  //     var no_number_password_user = angular.copy(MOCK.signed_in_user);
  //     no_number_password_user.password = 'badpassword1';
  //     fill_form(no_number_password_user);
  //     element("button:contains('Sign In')").click();
  //     expect(element('.alert.alert-error').text()).toBe('Password not correct.');
  //   });
  // });

  // describe("VALID SIGN UP", function () {
  //   it("should NOT show errors for for correct signup", function () {
  //     fill_form(MOCK.new_user_valid);
  //     element("button:contains('Sign Up')").click();		//INCOMPLETE
  //   });
  // });

  // // since user already gets created look at the possible paths
  // describe("REDIRECT to the HOMEPAGE", function () {
  //   it("should have HOME URL", function () {
  //     fill_form(MOCK.signed_in_user);
  //     element("button:contains('Sign In')").click();
  //     expect(browser().location().url()).toBe("/");
  //   });

  //   it("should show user's DISPLAY_NAME in NAVBAR", function () {
  //     expect(binding("current_person.display_name")).toBe(MOCK.new_user_valid.display_name);
  //   });
  });
});
