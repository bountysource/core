/*jshint -W117 */
'use strict';

describe('Scenario: Signining In --', function () {

  describe('Initial State', function() {
    it ("should have a SIGNIN Button that redirects to SIGNIN Page", function() {
      browser().navigateTo('/');
      expect(element('#home-signin').text()).toBe("Sign In");
      element('#home-signin').click();
      expect(browser().location().path()).toBe("/signin");
    });

  });

  describe("Sign In Process", function() {

    beforeEach(function () {
      browser().navigateTo('/signin');
      Mock.init();
    });

    it("should allow NEW USER to CREATE ACCOUNT and SIGNOUT", function () {
      Mock.push("/user/login", "POST", {"email": MOCK.new_account_valid.email}, {"data":{"error":"Email address not found.","email_is_registered":false},"meta":{"status":404,"success":false,"pagination":null}});
      Mock.push("/user/login", "POST", {"email": MOCK.new_account_valid.email, "password": MOCK.new_account_valid.password}, {"data":{"id":19425,"slug":"19425-testmctest","display_name":"TestMcTest","frontend_path":"#users/19425-testmctest","frontend_url":"https://www-qa.bountysource.com/#users/19425-testmctest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/noaoqqwxegvmulwus0un.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/noaoqqwxegvmulwus0un.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/noaoqqwxegvmulwus0un.png","created_at":"2013-08-06T20:19:42Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Test","last_name":"McTest","email":"sample@test.com","last_seen_at":"2013-08-06T20:19:42Z","updated_at":"2013-08-06T20:19:42Z","paypal_email":null,"exclude_from_newsletter":false,"access_token":"19425.1375907649.50c5b8a3d4efb89ed46201f20c8218bb263c2fad"},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user", "GET", {}, {"data":{"id":19425,"slug":"19425-testmctest","display_name":"TestMcTest","frontend_path":"#users/19425-testmctest","frontend_url":"https://www-qa.bountysource.com/#users/19425-testmctest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/noaoqqwxegvmulwus0un.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/noaoqqwxegvmulwus0un.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/noaoqqwxegvmulwus0un.png","created_at":"2013-08-06T20:19:42Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Test","last_name":"McTest","email":"sample@test.com","last_seen_at":"2013-08-06T20:19:42Z","updated_at":"2013-08-06T20:19:42Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      fill_form(MOCK.new_account_valid);
      blurEmailField();
      expect(element(".help-inline:visible").html()).toEqual("<small>Available!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign Up");
      using('form[name=form]').element(".btn:visible").click();
      expect(element("#navbar-user").text()).toMatch(MOCK.new_account_valid.display_name);
      element('#navbar-user-signout').click(); //signout to clear cookies. rewrite to inject appropriate angular service/provider
    });

    it("should FIND a REGISTERED USER when SIGNING IN", function () {
      Mock.push("/user/login", "POST", {"email": MOCK.existing_user.email}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404,"success":false,"pagination":null}}); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"
      fill_form(MOCK.valid_user);
      blurEmailField();
      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
    });

    it("should ALLOW registered user with valid password to SIGN IN", function() {
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user/login", "POST", MOCK.existing_user, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"access_token":"18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc"},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user/login", "POST", {"email": MOCK.existing_user.email}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404,"success":false,"pagination":null}}); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"
      fill_form(MOCK.valid_user);
      blurEmailField();
      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
      using('form[name=form]').element(".btn:visible").click();
      element('#navbar-user-signout').click();
    });

    it("should NOT ALLOW registered user with incorrect password to SIGN IN", function() {
      Mock.push("/user/login", "POST", {"email": MOCK.valid_user_wrong_pass.email, "password": MOCK.valid_user_wrong_pass.password}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404,"success":false,"pagination":null}});
      fill_form(MOCK.valid_user_wrong_pass);
      using('form[name=form]').element(".btn:visible").click();
      expect(element('.alert.alert-error').text()).toBe('Password not correct.');
    });

  });

});
