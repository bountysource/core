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
        var evt = document.createEvent("Event"); //extract into function later?
        evt.initEvent('blur', false, true);
        element[0].dispatchEvent(evt);
        done();
      });
      expect(element(".help-inline:visible").html()).toEqual("<small>Available!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign Up");

      //need to mock out clicking sign up for new account
    });

    it("should FIND a REGISTERED USER", function () {
      Mock.push("/user/login", "POST", {"email": MOCK.existing_user.email}, {"error":"Password not correct.","email_is_registered":true});
      fill_form(MOCK.signed_in_user);
      using('form[name=form]').element("input[name=email]").query(function(element, done) {
        var evt = document.createEvent("Event");
        evt.initEvent('blur', false, true);
        element[0].dispatchEvent(evt);
        done();
      });
      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In")
    });

    it("should allow registered user with valid password to SIGN IN", function() {
      Mock.push("/user/login", "POST", MOCK.existing_user, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"access_token":"18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc"},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}})
      fill_form(MOCK.signed_in_user);
      using('form[name=form]').element(".btn:visible").click();
      pause();
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
