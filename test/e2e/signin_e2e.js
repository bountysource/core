///*jshint -W117 */
///*jshint -W069 */
//'use strict';
//
//describe("CLEAR COOKIES TO ALLOW REFRESH", function() {
//  it("should clear cookies at start of test", function() {
//    browser().navigateTo('/');
//    //clear cookies at the end of the test. Allows refreshing of tests in-browser when singlerun-mode is false
//    cookies().clear("v2_access_token");
//  });
//});
//
//
//describe('Scenario: Signing In --', function () {
//
//  beforeEach(function() {
//    Mock.init();
//    Mock.pushScenario("/people/count", "GET", "success");
//  });
//
//  describe('Initial State --', function() {
//    it("should have a SIGNIN Button that redirects to SIGNIN Page", function() {
//      Mock.pushScenario("/people/count", "GET", "success");
//      browser().navigateTo('/');
//
//      var e = element('#navbar-provider-email');
//      e.click();
//
//      expect(browser().location().path()).toBe("/signin");
//    });
//
//    it("should have services presented as login options", function() {
//      expect(element("a#signin-github").count()).toBe(1);
//      expect(element("a#signin-twitter").count()).toBe(1);
//      expect(element("a#signin-facebook").count()).toBe(1);
//    });
//  });
//
//  describe("via Email --", function() {
//
//    beforeEach(function () {
//      browser().navigateTo('/signin');
//      Mock.init();
//      Mock.pushScenario("/people/count", "GET", "success");
//    });
//
//    it("should allow NEW USER to CREATE ACCOUNT and SIGNOUT", function () {
//      Mock.pushScenario("/user/login", "POST", "email-address-available");
//      Mock.pushScenario("/user/login", "POST", "create-account-email-auth");
//      Mock.pushScenario("/user", "GET", "success-email-auth");
//      fill_form(MOCK.new_account_valid);
//      blurEmailField();
//      expect(element(".help-inline:visible").html()).toEqual("<small>Available!</small>");
//      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign Up");
//      using('form[name=form]').element(".btn:visible").click();
//      expect(element("#navbar-user").text()).toMatch(MOCK.valid_user.display_name);
//      element('#navbar-user-signout').click(); //signout to clear cookies. rewrite to inject appropriate angular service/provider
//    });
//
//    it("should FIND a REGISTERED USER when SIGNING IN", function () {
//      Mock.pushScenario("/user/login", "POST", "email-address-found"); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"
//      fill_form(MOCK.valid_user);
//      blurEmailField();
//      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
//      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
//    });
//
//    it("should NOT ALLOW registered user with incorrect password to SIGN IN", function() {
//      Mock.pushScenario("/user/login", "POST", "email-address-found");
//      fill_form(MOCK.valid_user_wrong_pass);
//      using('form[name=form]').element(".btn:visible").click();
//      expect(element('.alert.alert-error').text()).toBe('Password not correct.');
//    });
//
//    it("should ALLOW registered user with valid password to SIGN IN", function() {
//      Mock.pushScenario("/user", "GET", "success-email-auth");
//      Mock.pushScenario("/user/login", "POST", "login-success-email-auth");
//      Mock.pushScenario("/user/login", "POST", "email-address-found"); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"
//      fill_form(MOCK.valid_user);
//      blurEmailField();
//      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
//      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
//      using('form[name=form]').element(".btn:visible").click();
//      element('#navbar-user-signout').click();
//    });
//  });
//
//  describe("via Service Provider --", function() {
//
//    beforeEach(function() {
//      browser().navigateTo('/signin');
//      Mock.init();
//    });
//
//    describe("with linked BountySource account --", function() {
//
//      it("service provider login should be successful", function() {
//        Mock.pushScenario("/trackers/cards", "GET", "success");
//        Mock.pushScenario("/user/interesting", "GET", "success");
//        Mock.pushScenario("/fundraisers/cards", "GET", "success");
//        Mock.pushScenario("/people/count", "GET", "success");
//        Mock.pushScenario("/user", "GET", "success-github-auth");
//        Mock.pushScenario("/user", "GET", "success-github-auth");
//        Mock.pushScenario("/fundraisers/cards", "GET", "success");
//        Mock.pushScenario("/people/:id/teams", "GET", "success");
//        Mock.pushScenario("/people/count", "GET", "success");
//        Mock.pushScenario("/user", "GET", "success-github-auth");
//        expect(element("a#signin-github").count()).toEqual(1);
//        browser().navigateTo('/signin/callback?provider=github&access_token=20117.1379028878.167f0b872b1c1d6f4763e1e78aea6e2fe7e9aa27&status=linked');
//        expect(element("a#navbar-user").text()).toContain("TheManliest");
//        expect(browser().location().path()).toEqual('/');
//        element('#navbar-user-signout').click();
//      });
//    });
//
//    describe("without linked BountySource account --", function() {
//
//      it("should create an account with service provider login", function() {
//        Mock.pushScenario("/trackers/cards", "GET", "success");
//        Mock.pushScenario("/user/interesting", "GET", "success");
//        Mock.pushScenario("/fundraisers/cards", "GET", "success");
//        Mock.pushScenario("/people/count", "GET", "success");
//
//        Mock.pushScenario("/user", "GET", "success-github-auth");
//        Mock.pushScenario("/user/login", "POST", "email-address-available");
//        browser().navigateTo('/signin/callback?provider=twitter&access_token=20117.1379028878.167f0b872b1c1d6f4763e1e78aea6e2fe7e9aa27&status=error_needs_account');
//        expect(browser().location().path()).toEqual('/signin');
//        fill_form(MOCK.new_account_valid);
//        blurEmailField();
//        expect(element(".help-inline:visible").html()).toEqual("<small>Available!</small>");
//        expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign Up");
//
//        using('form[name=form]').element(".btn:visible").click();
//        expect(browser().location().path()).toEqual('/');
//        expect(element("a#navbar-user").text()).toContain("TheManliest");
//
//        element('#navbar-user-signout').click();
//      });
//    });
//
//    describe("with current access token --", function() {
//
//      it("should log in on page load", function() {
//        Mock.pushScenario("/trackers/cards", "GET", "success");
//        Mock.pushScenario("/user/interesting", "GET", "success");
//        Mock.pushScenario("/fundraisers/cards", "GET", "success");
//        Mock.pushScenario("/people/:id/teams", "GET", "success");
//        Mock.pushScenario("/people/count", "GET", "success");
//        Mock.pushScenario("/user", "GET", "success-github-auth");
//
//        Mock.pushScenario("/trackers/cards", "GET", "success");
//        Mock.pushScenario("/user/interesting", "GET", "success");
//        Mock.pushScenario("/fundraisers/cards", "GET", "success");
//        Mock.pushScenario("/people/:id/teams", "GET", "success");
//        Mock.pushScenario("/people/count", "GET", "success");
//        Mock.pushScenario("/user", "GET", "success-github-auth");
//
//        browser().navigateTo('/signin/callback?provider=twitter&access_token=20117.1379028878.167f0b872b1c1d6f4763e1e78aea6e2fe7e9aa27&status=linked');
//        browser().reload();
//        expect(browser().location().path()).toEqual('/');
//        expect(element("a#navbar-user").text()).toContain("TheManliest");
//        element('#navbar-user-signout').click();
//      });
//
//    });
//
//  });
//
//});
//
//describe("Scenario: Signin redirect from bounty creation page --", function() {
//
//  beforeEach(function() {
//    Mock.init();
//  });
//
//  it("setting up BountySource account with service provider auth", function() {
//    Mock.pushScenario("/issues/:id", "GET", "success");
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//    Mock.pushScenario("/issues/:id", "GET", "success");
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//    Mock.pushScenario("/user", "GET", "success-github-auth");
//    Mock.pushScenario("/user/login", "POST", "email-address-available");
//
//    // gonna die
//    // Mock.pushScenario("/payments", "POST", "missing-access-token");
//
//    Mock.pushScenario("/issues/:id", "GET", "success");
//
//    Mock.pushScenario("/trackers/cards", "GET", "success");
//    Mock.pushScenario("/user/interesting", "GET", "success");
//    Mock.pushScenario("/fundraisers/cards", "GET", "success");
//    Mock.pushScenario("/people/count", "GET", "success");
//
//    Mock.pushScenario("/user/login", "POST", "login-success-email-auth");
//    Mock.pushScenario("/user/login", "POST", "email-address-available");
//
//    Mock.pushScenario("/user/bounties", "GET", "success");
//    Mock.pushScenario("/issues/:id", "GET", "success");
//    Mock.pushScenario("/issues/:id", "GET", "success");
//
//    browser().navigateTo('/issues/644/bounty?amount=15');
//    using("form[name=form]").element('button[type=submit].btn:visible').click();
//    expect(browser().location().path()).toEqual("/signin");
//    browser().navigateTo('/signin/callback?provider=github&access_token=20117.1379028878.167f0b872b1c1d6f4763e1e78aea6e2fe7e9aa27&status=error_needs_account');
//    expect(browser().location().path()).toEqual('/signin');
//    fill_form(MOCK.new_account_valid);
//    blurEmailField();
//    expect(element(".help-inline:visible").html()).toEqual("<small>Available!</small>");
//    expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign Up");
//
//    using('form[name=form]').element(".btn:visible").click();
//    expect(browser().location().path()).toEqual('/issues/644-use-an-array-for-web-breadcrumbs-5-00/bounty');
//    expect(input('bounty.amount').val()).toEqual('15');
//    expect(element("a#navbar-user").text()).toContain("TheManliest");
//
//    element('#navbar-user-signout').click();
//  });
//
//  it("logging into BountySource account with service provider auth", function() {
//
//    Mock.pushScenario("/issues/:id", "GET", "success");
//    Mock.pushScenario("/issues/:id", "GET", "success");
//    Mock.pushScenario("/issues/:id", "GET", "success");
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//    Mock.pushScenario("/user", "GET", "success-github-auth");
//    Mock.pushScenario("/payments", "POST", "missing-access-token");
//    Mock.pushScenario("/user/bounties", "GET", "missing-access-token");
//    Mock.pushScenario("/issues/:id", "GET", "success");
//    Mock.pushScenario("/issues/:id", "GET", "success");
//
//
//    browser().navigateTo('/issues/644-use-an-array-for-web-breadcrumbs-5-00/bounty?amount=15');
//    using("form[name=form]").element('button[type=submit].btn:visible').click();
//    expect(browser().location().path()).toEqual("/signin");
//    browser().navigateTo('/signin/callback?provider=github&access_token=20117.1379028878.167f0b872b1c1d6f4763e1e78aea6e2fe7e9aa27&status=linked');
//    expect(browser().location().path()).toEqual('/issues/644-use-an-array-for-web-breadcrumbs-5-00/bounty');
//    expect(input('bounty.amount').val()).toEqual('15');
//    expect(element("a#navbar-user").text()).toContain("TheManliest");
//
//    element('#navbar-user-signout').click();
//
//  });
//
//});
//
//describe("Scenario: Signin redirect from pledge creation page --", function() {
//  it("sets up a BountySource account with service provider auth", function() {
//    //GET request for "/fundraisers/455-edutrac" occurs twice with each page load
//
//
//    Mock.pushScenario("/user/fundraisers/:id", "GET", "success-update");
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//
//    Mock.pushScenario("/user", "GET", "success-github-auth");
//
//    Mock.pushScenario("/user/login", "POST", "email-address-available");
//    Mock.pushScenario("/payments", "POST", "missing-access-token");
//    Mock.pushScenario("/fundraisers/:id", "GET", "success");
//    Mock.pushScenario("/user/contributions", "GET", "missing-access-token");
//    Mock.pushScenario("/fundraisers/:id", "GET", "success");
//
//    browser().navigateTo('/fundraisers/451-fake-fundraiser/pledge');
//    using('form[name=pledge_form]').element("input[value='829']").click();
//    input('pledge.survey_response').enter('here is your required text, good sir!');
//    expect(input('pledge.amount').val()).toEqual('200');
//    using('form[name=pledge_form]').element('.btn:visible').click();
//    expect(browser().location().path()).toEqual('/signin');
//    browser().navigateTo('/signin/callback?provider=github&access_token=20117.1379028878.167f0b872b1c1d6f4763e1e78aea6e2fe7e9aa27&status=error_needs_account');
//    expect(browser().location().path()).toEqual('/signin');
//    fill_form(MOCK.new_account_valid);
//    blurEmailField();
//    expect(element(".help-inline:visible").html()).toEqual("<small>Available!</small>");
//    expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign Up");
//    using('form[name=form]').element(".btn:visible").click();
//
//    expect(browser().location().path()).toEqual('/fundraisers/451-fake-fundraiser/pledge');
//    expect(input('pledge.amount').val()).toEqual('200');
//    // FAILING expect(input('pledge.survey_response').val()).toEqual('here is your required text, good sir!');
//    expect(element("a#navbar-user").text()).toContain("TheManliest");
//    element('#navbar-user-signout').click();
//  });
//
//  it("logs into BountySource account with service provider auth", function() {
//    //GET request for "/fundraisers/455-edutrac" occurs twice with each page load
//
//    Mock.pushScenario("/people/:id/teams", "GET", "success");
//    Mock.pushScenario("/fundraisers/:id", "GET", "success");
//    Mock.pushScenario("/fundraisers/:id", "GET", "success");
//
//    Mock.pushScenario("/user", "GET", "success-github-auth");
//
//    Mock.pushScenario("/payments", "POST", "missing-access-token");
//    Mock.pushScenario("/fundraisers/:id", "GET", "success");
//    Mock.pushScenario("/user/contributions", "GET", "missing-access-token");
//    Mock.pushScenario("/fundraisers/:id", "GET", "success");
//
//    browser().navigateTo('/fundraisers/451-fake-fundraiser/pledge');
//    using('form[name=pledge_form]').element("input[value='829']").click();
//    input('pledge.survey_response').enter('here is your required text, good sir!');
//    expect(input('pledge.amount').val()).toEqual('200');
//    using('form[name=pledge_form]').element('.btn:visible').click();
//    expect(browser().location().path()).toEqual('/signin');
//    browser().navigateTo('/signin/callback?provider=github&access_token=20117.1379028878.167f0b872b1c1d6f4763e1e78aea6e2fe7e9aa27&status=linked');
//
//    expect(browser().location().path()).toEqual('/fundraisers/451-fake-fundraiser/pledge');
//    expect(input('pledge.amount').val()).toEqual('200');
//    // FAILING expect(input('pledge.survey_response').val()).toEqual('here is your required text, good sir!');
//    expect(element("a#navbar-user").text()).toContain("TheManliest");
//    element('#navbar-user-signout').click();
//
//  });
//
//});
