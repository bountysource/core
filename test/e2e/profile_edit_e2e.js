/*jshint -W117 */
/*jshint -W069 */
'use strict';

describe("Scenario: Editing Profile Information", function() {

  beforeEach(function () {
    Mock.init();
  });


  describe("Loading the Account Settings Page", function() {

    describe("Loading the profile settings partial", function() {

      // it("should ALLOW registered user with valid password to SIGN IN", function() {
      //   // for the user info dropdown in the nav...
      //   browser().navigateTo('/signin');
      //   cookies().clear("v2_access_token");
      //   Mock.pushScenario("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200, "success":true, "pagination":null}}, RESPONSE_MOCK["/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null, "facebook_account":null, "gittip_account":null});
      //   // for the $person resolve to require auth on a page
      //   // go look at $api.load_current_person_from_cookies in api.js:431
      //   Mock.pushScenario("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200, "success":true, "pagination":null}}, RESPONSE_MOCK["/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null, "facebook_account":null, "gittip_account":null});
      //   Mock.pushScenario("/user/login", "POST", MOCK.valid_user, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"access_token":"18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc"},"meta":{"status":200, "success":true, "pagination":null}}, RESPONSE_MOCK["/user/login", "POST", MOCK.valid_user, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null, "exclude_from_newsletter":false, "access_token":"18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc"});
      //   Mock.pushScenario("/user/login", "POST", {"email": MOCK.existing_user.email}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404, "success":false, "pagination":null}}, RESPONSE_MOCK["/user/login", "POST", {"email": MOCK.existing_user.email},  {"data":{"error":"Password not correct.", "email_is_registered":true}); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"

      //   fill_form(MOCK.valid_user);
      //   blurEmailField();
      //   expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
      //   expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
      //   using('form[name=form]').element(".btn:visible").click();
      // });

      it("should load the profile settings partial", function() {
        Mock.pushScenario("/user", "GET", "success-email-auth");
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

  describe("Editing profile information", function() {

    it("should save changes to all profile fields", function() {
      Mock.pushScenario("/user", "PUT", "success");
      element("#navbar-user-settings").click();

      input('form_data.location').enter(MOCK.existing_user.location);
      input('form_data.company').enter(MOCK.existing_user.company);
      input('form_data.url').enter(MOCK.existing_user.url);
      input('form_data.public_email').enter(MOCK.existing_user.public_email);
      input('form_data.bio').enter(MOCK.existing_user.bio);

      element("button[ng-click='save()']").click();
      expect(element("div[ng-show='success']").css("display")).toBe("block");
    });

    it("should display recent changes to profile information", function() {
      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/people/:id/activity", "GET", "success");
      Mock.pushScenario("/users/:id", "GET", "success");
      element("#navbar-user-profile").click();
      profileCheck(MOCK.check_existing_user);
      expect(element("a:contains('Edit')").count()).toBe(1);
      element("a:contains('Edit')").click();
    });

  });

  describe("Editing account settings", function() {

    it("should NOT allow user to change password when submitting an incorrect current password", function() {
      Mock.pushScenario("/user/change_password", "POST", "incorrect-password");
      element("a[ng-href='/settings/accounts']").click();
      input("form_data.current_password").enter("wrong");
      input("form_data.new_password").enter("dontmatter12");
      element("button:contains('Change Password')").click();
      expect(binding("error")).toBe("Current password not correct");
    });

    it("should NOT allow user to submit new password that is less than 8 characters and not alphanumeric", function() {
      Mock.pushScenario("/user/change_password", "POST", "new-password-not-alphanumeric-not-sufficient-length");
      input("form_data.current_password").enter("MANLINESS123456");
      input("form_data.new_password").enter("a");
      element("button:contains('Change Password')").click();
      expect(binding("error")).toBe("Unable to change password: Password is too short (minimum is 8 characters), Password must contain a letter and a number");
    });

    it("should NOT allow user to submit new password that is alphanumeric, but not at least 8 characters", function() {
      Mock.pushScenario("/user/change_password", "POST", "new-password-not-sufficient-length");
      input("form_data.current_password").enter("MANLINESS123456");
      input("form_data.new_password").enter("lol1");
      element("button:contains('Change Password')").click();
      expect(binding("error")).toBe("Unable to change password: Password is too short (minimum is 8 characters)");
    });

    it("should NOT allow user to submit new password that is at least 8 characters, BUT doesn't contain numbers", function() {
      Mock.pushScenario("/user/change_password", "POST", "new-password-requires-numbers");
      input("form_data.current_password").enter("MANLINESS123456");
      input("form_data.new_password").enter("longbutnonumber");
      element("button:contains('Change Password')").click();
      expect(binding("error")).toBe("Unable to change password: Password must contain a letter and a number");
    });

    it("should NOT allow user to submit new password that is at least 8 characters, BUT doesn't contain letters", function() {
      Mock.pushScenario("/user/change_password", "POST", "new-password-requires-letters");
      input("form_data.current_password").enter("MANLINESS123456");
      input("form_data.new_password").enter("$$1337$$");
      element("button:contains('Change Password')").click();
      expect(binding("error")).toBe("Unable to change password: Password must contain a letter and a number");
    });

    it("should allow user to submit a new valid password", function() {
      Mock.pushScenario("/user/change_password", "POST", "success");
      input("form_data.current_password").enter("MANLINESS123456");
      input("form_data.new_password").enter("newvalid1");
      element("button:contains('Change Password')").click();
      expect(binding("success")).toBe("Successfully updated password!");
    });

  });

  describe("Editing email settings", function() {

    it("should NOT save an invalid primary email address", function() {
      Mock.pushScenario("/user", "GET", "success-email-auth");
      element("a[ng-href='/settings/email']").click();
      input("form_data.email").enter("lol");
      element("button:contains('Save')").click();
      expect(binding("error")).toBe("Unable to update email settings!");
    });

    it("should allow saving of valid primary email address", function() {
      Mock.pushScenario("/user", "PUT", "success-new-email");
      input("form_data.email").enter("newemail@gmail.com");
      element("button:contains('Save')").click();
      expect(binding("success")).toBe("Email settings updated!");
      expect(element("#inputTerms:checked").count()).toBe(1);
    });

    it("should allow toggling of weekly newsletter", function() {
      Mock.pushScenario("/user", "PUT", "success-new-email-and-newsletter");
      input("form_data.weekly_newsletter").check();
      element("button:contains('Save')").click();
      expect(binding("success")).toBe("Email settings updated!");
      expect(element("#inputTerms:checked").count()).toBe(0);
    });

  });

});
