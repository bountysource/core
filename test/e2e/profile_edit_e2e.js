/*jshint -W117 */
'use strict';

describe("Scenario: Editing Profile Information", function() {

  beforeEach(function () {
    Mock.init();
  });

  describe("Loading the edit page", function() {

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

      it("should load the profile settings partial", function() {
        Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
        browser().navigateTo("/settings");
        expect(browser().location().path()).toBe("/settings");
      });

      it("should display correct settings tabs", function() {
        expect(repeater("li[ng-repeat='tab in tabs']").count()).toBe(3);
        var tabs = element("li[ng-repeat='tab in tabs']").query(function(element, done) {

          if (element[0].children[0].text === "Profile" && element[1].children[0].text === "Accounts" && element[2].children[0].text === "Email") {
            done(null, "Correct tabs");
          } else {
            done(null, "Incorrect tabs!");
          }

        });

        expect(tabs).toBe("Correct tabs");
      });

      it("should have the correct input fields", function() {
        findFields("form_data", MOCK.edit_existing_user);
      });

    });

    describe("Loading the accounts settings partial", function() {

      it("should load the account settings partial", function() {
        element("a[ng-href='/settings/accounts']").click();
        expect(browser().location().path()).toBe("/settings/accounts");
      });

      it("should have the appropriate fields", function() {
        expect(input("form_data.current_password").val()).toBeDefined();
        expect(input("form_data.new_password").val()).toBeDefined();
        expect(element("button:contains('Change Password')").count()).toBe(1);
        expect(element("a[ng-click='set_post_auth_url()']").count()).toBe(3);
      });

    });

    describe("Loading the email settings partial", function() {

      it("should load the email settings partial", function() {
        element("a[ng-href='/settings/email']").click();
        expect(browser().location().path()).toBe("/settings/email");
      });

      it("should have the appropriate fields", function() {
        expect(input("form_data.email").val()).toBeDefined();
        expect(element("button:contains('Save')").count()).toBe(1);
      });

    });

  });

  describe("Editing account information", function() {

    it("should save changes to display name", function() {
      Mock.push("/user", "PUT", {"first_name":"Mister","last_name":"ManlyMan","display_name":"TheManliestMan","bio":null,"location":null,"company":"Wernham Hog","url":null,"public_email":null,"image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d"}, {"data":{"id":19896,"slug":"19896-themanliestman","display_name":"TheManliestMan","frontend_path":"#users/19896-themanliestman","frontend_url":"https://www-qa.bountysource.com/#users/19896-themanliestman","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/noaoqqwxegvmulwus0un.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/noaoqqwxegvmulwus0un.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/noaoqqwxegvmulwus0un.png","created_at":"2013-08-09T00:06:26Z","bio":null,"location":null,"company":"Wernham Hog","url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-15T17:57:57Z","updated_at":"2013-08-15T18:03:15Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      element("a[ng-href='/settings']").click();
      input("form_data.display_name").enter("TheManliestMan");
      input("form_data.company").enter("Wernham Hog");
      element("button[ng-click='save()']").click();
      expect(element("div[ng-show='success']").css("display")).toBe("block");
    });

  });

});


describe("CLEAR COOKIES TO ALLOW REFRESH", function() {
  it("should clear cookies at end of test", function() {
    //clear cookies at the end of the test. Allows refreshing of tests in-browser when singlerun-mode is false
    cookies().clear("v2_access_token");
  });
});
