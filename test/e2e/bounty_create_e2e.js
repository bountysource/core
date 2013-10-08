/*jshint -W117 */
/*jshint -W069 */
'use strict';

describe("Scenario: Creating Bounties --", function() {

  beforeEach(function () {
    Mock.init();
  });

  describe("Loading the bounty tracker page", function() {

    it("should show the bounty tracker page", function() {
      Mock.pushScenario("/projects/:id/issues", "GET", "success");
      Mock.pushScenario("/stats/trackers/:id", "GET", "success");
      Mock.pushScenario("/trackers/:id/overview", "GET", "success");
      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");
      browser().navigateTo("/trackers/47-bountysource-frontend");
      expect(element("button[ng-click='tracker.follow()']").count()).toBe(1);
      expect(element("a[ng-href='https://github.com/bountysource/frontend']").count()).toBe(1);
      expect(element("a[ng-click='show_bounties()']").count()).toBe(1);
      expect(binding("tracker_stats.collected_total | dollars")).toBe("$280");
      expect(input("issue_filter_options.text").val()).toBeDefined();
      expect(input("issue_filter_options.bounty_min").val()).toBeDefined();
      expect(input("issue_filter_options.bounty_max").val()).toBeDefined();
      expect(input("issue_filter_options.only_valuable").val()).toBeDefined();
      expect(input("issue_filter_options.hide_open").val()).toBeDefined();
      expect(input("issue_filter_options.hide_closed").val()).toBeDefined();
      expect(element("table[ng-show='(issues | filter:issue_filter).length > 0']").count()).toBe(1);
    });

    it("should let user view bounty page", function() {
      Mock.pushScenario("/issues/:id", "GET", "success");
      Mock.pushScenario("/issues/:id", "GET", "success");
      Mock.pushScenario("/issues/:id", "GET", "success");

      element("a:contains('All external links should open in a new tab')").click();
      expect(browser().location().path()).toBe("/issues/467715-all-external-links-should-open-in-a-new-tab");
      expect(binding("issue.bounty_total")).toBe("$5");
      expect(element("a[ng-click='place_bounty_redirect(15)']").count()).toBe(1);
      expect(element("a[ng-click='place_bounty_redirect(35)']").count()).toBe(1);
      expect(element("a[ng-click='place_bounty_redirect(50)']").count()).toBe(1);
      expect(element("a[ng-click='place_bounty_redirect(100)']").count()).toBe(1);
      expect(element("a[ng-click='place_bounty_redirect(250)']").count()).toBe(1);
      expect(element("a[ng-click='place_bounty_redirect(500)']").count()).toBe(1);
      expect(element("a[ng-click='place_bounty_redirect(1000)']").count()).toBe(1);
      expect(input("bounty.amount").val()).toBeDefined();
    });

    it("should not allow $0 bounty", function() {
      input("bounty.amount").enter("0");
      element("input#custom-amount-submit").click();
      expect(browser().location().path()).not().toBe("/issues/467715-all-external-links-should-open-in-a-new-tab/bounty");
      expect(browser().location().path()).toBe("/issues/467715-all-external-links-should-open-in-a-new-tab");
    });

  });

  describe("Bounty creation page", function() {

    describe("loading from bounty tracker page", function() {

      beforeEach(function () {
        Mock.pushScenario("/payments", "POST", "success");
        Mock.pushScenario("/issues/:id", "GET", "success");
        Mock.pushScenario("/issues/:id", "GET", "success");
        Mock.pushScenario("/issues/:id", "GET", "success");
        Mock.pushScenario("/people/:id/teams", "GET", "success");
        Mock.pushScenario("/user", "GET", "success-email-auth");
        browser().navigateTo("/issues/467715-all-external-links-should-open-in-a-new-tab/");
      });

      it("clicking a $ button takes you to issues/:id/bounty", function() {
        element("a[ng-click='place_bounty_redirect(15)']").click();
        expect(browser().location().path()).toBe("/issues/467715-all-external-links-should-open-in-a-new-tab/bounty");
      });

      it("submitting the custom $ amount takes you to issues/:id/bounty", function() {
        input('bounty.amount').enter("5");
        element("input#custom-amount-submit").click();
        expect(browser().location().path()).toBe("/issues/467715-all-external-links-should-open-in-a-new-tab/bounty");
      });

      it("$scope.bounty.amount is initialized to the amount specified on the button", function() {
        Mock.pushScenario("/issues/:id", "GET", "success");
        element("a[ng-click='place_bounty_redirect(15)']").click();
        expect(input("bounty.amount").val()).toBe("15");
      });

    });

    it("should display radio inputs", function() {
      expect(element("input[type=radio][value=google]").count()).toEqual(1);
      expect(element("input[type=radio][value=paypal]").count()).toEqual(1);
    });

    it("should allow a bounty to be placed on an issue", function() {
      input('bounty.amount').enter("25");
      expect(element('button[type=submit]').count()).toBe(1);
      using("form[ng-submit='create_payment()']").element('button[type=submit]').click();
      expect(google_wallet().start()).toBe("Google wallet called");
    });

  });

});
