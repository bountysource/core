/*jshint -W117 */
/*jshint -W069 */
'use strict';

describe('Scenario: Creating A Fundraiser --', function () {
  beforeEach(function () {
    Mock.init();
  });

  describe('Form View and Inputs', function () {

    it("should ALLOW registered user with valid password to SIGN IN", function() {
      Mock.pushScenario("/people/count", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");
      Mock.pushScenario("/user/login", "POST", "login-success-email-auth");
      Mock.pushScenario("/user/login", "POST", "email-address-found"); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"
      // for the user info dropdown in the nav...
      browser().navigateTo('/signin');
      cookies().clear("v2_access_token");
      // for the $person resolve to require auth on a page
      // go look at $api.load_current_person_from_cookies in api.js:431

      fill_form(MOCK.valid_user);
      blurEmailField();
      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
      using('form[name=form]').element(".btn:visible").click();
    });

    it("should allow signed in user to view the fundraisers form", function () {
      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");
      Mock.pushScenario("/fundraisers/cards", "GET", "success");

      browser().navigateTo("/fundraisers/new");
      //load current person from cookies
      expect(browser().location().path()).toBe("/fundraisers/new");
    });

    it("should not find something that I made up", function () {
      expect(input('a13yczzymn')).not().toBeDefined();
    });

    it("should have a button for submit", function () {
      var found_button = element("button[ng-click='create()']").count();
      expect(found_button).toEqual(1);
    });

    it("should have input for title", function () {
      expect(input('fundraiser.title').val()).toBeDefined();
    });


    it("should have input for funding_goal", function () {
      expect(input('fundraiser.funding_goal').val()).toBeDefined();
    });

    it("should have input for image_url", function () {
      expect(input('fundraiser.image_url').val()).toBeDefined();
    });

    it("should have input for homepage_url", function () {
      expect(input('fundraiser.homepage_url').val()).toBeDefined();
    });

    it("should have input for repo_url", function () {
      expect(input('fundraiser.repo_url').val()).toBeDefined();
    });

    it("should have input for description", function () {
      expect(input('fundraiser.description').val()).toBeDefined();
    });

    it("should have input for short_description", function () {
      expect(input('fundraiser.short_description').val()).toBeDefined();
    });

  });

  describe("Checkbox functionality", function() {
    var expected_checks = 1; //funding goal defaultly set => one condition is met
    it("should initially have only funding goal checked", function () {
      expect(element('input:checked').count()).toBe(expected_checks);
    });

    it("should have 2 checked when filled = {title} && bounty_goal is valid", function () {
      input('fundraiser.title').enter(MOCK.fundraiser.title);
      expected_checks = 2;
      expect(element('input:checked').count()).toBe(expected_checks);
    });

    it("should have 3 checked filled = {title, description} && bounty_goal is valid", function () {
      input('fundraiser.title').enter(MOCK.fundraiser.title);
      input('fundraiser.description').enter(MOCK.fundraiser.description);
      expected_checks = 3;
      expect(element('input:checked').count()).toBe(expected_checks);
    });

    it("should have 4 checked when all fields are valid", function () {
      input('fundraiser.title').enter(MOCK.fundraiser.title);
      input('fundraiser.description').enter(MOCK.fundraiser.description);
      input('fundraiser.short_description').enter(MOCK.fundraiser.short_description);
      expected_checks = 4;
      expect(element('input:checked').count()).toBe(expected_checks);
    });

    it("should enable create fundraisers button when all fields are filled", function () {
      input('fundraiser.title').enter(MOCK.fundraiser.title);
      input('fundraiser.description').enter(MOCK.fundraiser.description);
      input('fundraiser.short_description').enter(MOCK.fundraiser.short_description);
      var found_button = element("button[ng-click='create()']:enabled").count();
      expect(found_button).toBe(1);
    });

  });

  describe("Submitting a fundraisers", function() {

    describe("Creating the fundraisers", function() {
      it("should allow signed in user to create a fundraisers", function() {
        Mock.pushScenario("/user/fundraisers/:id", "GET", "success");
        Mock.pushScenario("/people/:id/teams", "GET", "success");
        Mock.pushScenario("/user/fundraisers", "POST", "success");

        input('fundraiser.title').enter(MOCK.fundraiser.title);
        input('fundraiser.short_description').enter(MOCK.fundraiser.short_description);
        input('fundraiser.funding_goal').enter(MOCK.fundraiser.funding_goal);
        input('fundraiser.image_url').enter(MOCK.fundraiser.image_url);
        input('fundraiser.homepage_url').enter(MOCK.fundraiser.homepage_url);
        input('fundraiser.repo_url').enter(MOCK.fundraiser.repo_url);
        element("button[ng-click='create()']:enabled").click();
        sleep(1); //page needs second to load
      });

      it("should take user to Edit page upon creation", function() {
        Mock.pushScenario("/user/fundraisers/:id", "GET", "success");
        expect(browser().location().path()).toBe("/fundraisers/451-fake-fundraisers/edit");
      });

    });

    describe("Edit Page for new fundraisers", function() {

      describe("Basic elements", function() {

        it("should have a save button", function() {
          expect(element("button[ng-click='save()']").count()).toBe(1);
        });

        it("should have a cancel button", function() {
          expect(element("button[ng-click='cancel()']").count()).toBe(1);
        });

      });

      describe("Awards Section", function() {

        it("should have rewards form", function() {
          expect(element("div[ng-controller='RewardsController']").count()).toBe(1);
        });

        it("should initially have a disabled 'Add Reward' Button", function() {
          expect(element("button[ng-click='create_reward(fundraisers)']:disabled").count()).toBe(1);
        });

        it("should have an input for minimum pledge amount", function() {
          expect(input("new_reward.amount").val()).toBeDefined();
        });

        it("should have an input for reward limit", function() {
          expect(input("new_reward.limited_to").val()).toBeDefined();
        });

        it("should have an input for reward description", function() {
          expect(input("new_reward.description").val()).toBeDefined();
        });

        it("should have an input for reward fullfillment details", function() {
          expect(input("new_reward.fulfillment_details").val()).toBeDefined();
        });

        it("after input should have an enabled 'Add Reward' Button", function() {
          findAndFillFields("new_reward", MOCK.new_reward);
          expect(element("button[ng-click='create_reward(fundraisers)']:enabled").count()).toBe(1);
        });

        it("should allow the submission of a new reward", function() {
          Mock.pushScenario("/user/fundraisers/:id/rewards", "POST", "success");
          element("button[ng-click='create_reward(fundraisers)']:enabled").click();
          expect(element("div[heading='$25 Reward']").count()).toBe(1);
        });

        it("should allow the edit-awards drop-down", function() {
          expect(element("a:contains('$25 Reward')").count()).toBe(1);
          element("a:contains('$25 Reward')").click();
          expect(element("button[ng-click='update_reward(fundraisers, reward)']").count()).toBe(1);
          expect(element("button[ng-click='cancel_reward_changes(reward)']").count()).toBe(1);
          expect(element("button[ng-click='destroy_reward(fundraisers, reward)']").count()).toBe(1);
        });

      });

    });

    describe("Saving new fundraisers", function() {

      it("should allow the saving of a newly created fundraisers", function() {
        Mock.pushScenario("/user/fundraisers/:id", "GET", "success");
        Mock.pushScenario("/user/fundraisers/:id/pledges", "GET", "success");

        Mock.pushScenario("/user/fundraisers/:id/pledges", "GET", "success");
        Mock.pushScenario("/user/fundraisers/:id", "GET", "success");
        Mock.pushScenario("/user/fundraisers/:id", "PUT", "success");
        element("button[ng-click='save()']").click();
        expect(browser().location().path()).toBe("/fundraisers/451-fake-fundraisers");
      });

      it("should show the new/publish page", function() {
        expect(element("a[ng-show='fundraisers.published && fundraisers.in_progress && !fundraiser_hide_pledge_button']").css("display")).toBe("none");
        expect(element("a[ng-show='!fundraisers.published']").css("display")).toBe("block");
        expect(element("a:contains('Edit Fundraiser')").count()).toBe(1);
        expect(element("button[ng-click='publish(fundraisers)']").count()).toBe(1);
      });

      it("should publish a fundraisers", function() {
        Mock.pushScenario("/user/fundraisers/:id", "GET", "success-update");
        Mock.pushScenario("/user/fundraisers/:id/pledges", "GET", "success");
        Mock.pushScenario("/user/fundraisers/:id/pledges", "GET", "success");
        Mock.pushScenario("/user/fundraisers/:id", "GET", "success-update");
        Mock.pushScenario("/people/:id/teams", "GET", "success");
        Mock.pushScenario("/user", "GET", "success-email-auth");
        Mock.pushScenario("/user/fundraisers/:id/publish", "POST", "success");
        element("button[ng-click='publish(fundraisers)']").click();
        sleep(1); //allow time for the page to load
        expect(browser().location().path()).toEqual("/fundraisers/451-fake-fundraisers");
        expect(element("button[ng-click='create_update()']").count()).toBe(1);
      });

    });

  });

});
