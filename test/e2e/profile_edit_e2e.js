/*jshint -W117 */
'use strict';

describe("Scenario: Editing Profile Information", function() {

  beforeEach(function () {
    Mock.init();
  });

  describe("Loading the profile settings page", function() {

    // it("should ALLOW registered user with valid password to SIGN IN", function() {
    //   // for the user info dropdown in the nav...
    //   browser().navigateTo('/signin');
    //   cookies().clear("v2_access_token");
    //   Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
    //   // for the $person resolve to require auth on a page
    //   // go look at $api.load_current_person_from_cookies in api.js:431
    //   Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
    //   Mock.push("/user/login", "POST", MOCK.valid_user, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"access_token":"18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc"},"meta":{"status":200,"success":true,"pagination":null}});
    //   Mock.push("/user/login", "POST", {"email": MOCK.existing_user.email}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404,"success":false,"pagination":null}}); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"

    //   fill_form(MOCK.valid_user);
    //   blurEmailField();
    //   expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
    //   expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
    //   using('form[name=form]').element(".btn:visible").click();
    // });

    it("should display the users profile information", function() {
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      browser().navigateTo("/settings");
      expect(browser().location().path()).toBe("/settings");
    });

  });

});


describe("CLEAR COOKIES TO ALLOW REFRESH", function() {
  it("should clear cookies at end of test", function() {
    //clear cookies at the end of the test. Allows refreshing of tests in-browser when singlerun-mode is false
    cookies().clear("v2_access_token");
  });
});
