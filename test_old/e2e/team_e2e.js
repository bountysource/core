/*jshint -W117 */
/*jshint -W069 */
'use strict';

describe("Scenario: Creating a team --", function() {

  beforeEach(function() {
    Mock.init();
    browser().navigateTo('/teams/new');
  });

  it("should error without name", function() {
    Mock.pushScenario("/teams", "POST", "missing-name-input");
    Mock.pushScenario("/teams/:id/members", "GET", "team-not-found");
    Mock.pushScenario("/teams/:id/members", "GET", "team-not-found");
    Mock.pushScenario("/teams/:id", "GET", "team-not-found");
    Mock.pushScenario("/people/:id/teams", "GET", "success");
    Mock.pushScenario("/user", "GET", "success-email-auth");

    using('form').input('form_data.name').enter(MOCK.invalid_team_no_name.name);
    using('form').input('form_data.slug').enter(MOCK.invalid_team_no_name.slug);
    using('form').input('form_data.url').enter('http://www.bountysource.com');
    using('form').input('form_data.image_url').enter('https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/jny9veh9xwqljpqpox0z.png');
    using('form').input('form_data.bio').enter("bountysource is THE open source funding platform");
    using('form').element('submit.btn').click();
    expect(element('.alert.alert-error').text()).toContain("Team not found");
  });

  it("should not allow characters in custom url", function() {
    Mock.pushScenario("/teams/:id/members", "GET", "team-not-found");
    Mock.pushScenario("/teams/:id/members", "GET", "team-not-found");
    Mock.pushScenario("/people/:id/teams", "GET", "success");
    Mock.pushScenario("/user", "GET", "success-email-auth");
    using('form').input('form_data.name').enter(MOCK.invalid_team_bad_slug.name);
    using('form').input('form_data.slug').enter(MOCK.invalid_team_bad_slug.slug);
    expect(input('form_data.slug').val()).toMatch('');
  });

  describe("successful team creation --", function() {
    it("should redirect to team member management page", function() {
      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success");
      Mock.pushScenario("/teams/:id/invites", "GET", "success");
      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success");

      //temporarily comment this out. seems to be blocking team tests.

      // Mock.pushScenario("/teams", "POST", "success");
      // Mock.pushScenario("/teams/:id/members", "GET", "team-not-found");

      // Mock.pushScenario("/teams/:id/members", "GET", "team-not-found");
      Mock.pushScenario("/teams", "POST", "success");

      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");

      using('form').input('form_data.name').enter(MOCK.valid_team.name);
      using('form').input('form_data.slug').enter(MOCK.valid_team.slug);
      using('form').input('form_data.url').enter('http://www.bountysource.com');
      using('form').input('form_data.image_url').enter('https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/jny9veh9xwqljpqpox0z.png');
      using('form').input('form_data.bio').enter("bountysource is THE open source funding platform");
      using('form').element('submit.btn').click();

      expect(browser().location().path()).toEqual('/teams/'+MOCK.valid_team.slug);
    });
  });

});

describe("Scenario: Using Team Account --", function() {
  beforeEach(function() {
    Mock.init();
  });

  // TODO: This doesn't test_old teams being able to place bounties.
  // It should use the form on "/teams/:slug", then submit payment with TEAM
  // as the payment method, not Google Wallet..
  xit("should let you create a bounty", function() {
    Mock.pushScenario("/people/:id/teams", "GET", "success");
    Mock.pushScenario("/issues/:id", "GET", "success");
    Mock.pushScenario("/people/:id/teams", "GET", "success");
    Mock.pushScenario("/user", "GET", "success-email-auth");

    Mock.pushScenario("/teams/:id/members", "GET", "success");
    Mock.pushScenario("/teams/:id", "GET", "success");
    Mock.pushScenario("/people/:id/teams", "GET", "success");
    Mock.pushScenario("/user", "GET", "success-email-auth");

    browser().navigateTo('/teams/'+MOCK.valid_team.slug);
    expect(browser().location().path()).toEqual('/teams/'+MOCK.valid_team.slug);
    browser().navigateTo('/issues/'+MOCK.issue.slug+'/bounty?amount=15');
    var radioButton = ["input[value='team/", MOCK.valid_team.id, "']"].join("");
    element(radioButton).click();

    expect(element('button[type=submit]').count()).toBe(1);
    using("form[ng-submit='create_payment()']").element('button[type=submit]').click();
    expect(google_wallet().start()).toBe("Google wallet called");
  });

  xit("should let you create pledge", function() {
    Mock.pushScenario("/user/pledges", "GET", "success");
    Mock.pushScenario("/user", "GET", "success-email-auth");

    Mock.pushScenario("/payments", "POST", "success");

    Mock.pushScenario("/user/fundraiser/:id", "GET", "success");
    Mock.pushScenario("/people/:id/teams", "GET", "success");
    Mock.pushScenario("/user/fundraiser/:id", "GET", "success");
    Mock.pushScenario("/people/:id/teams", "GET", "success");
    Mock.pushScenario("/user", "GET", "success-email-auth");
    browser().navigateTo('/fundraiser/'+MOCK.fundraiser.id+'/pledge');
    var radioButton = ["input[value='team/", MOCK.valid_team.id, "']"].join("");
    element(radioButton).click();
    expect(element("button[ng-click='create_payment()']:visible").count()).toBe(1);
    element("button[ng-click='create_payment()']:visible").click(); //this click action isn't taking place, set spec to pending for now
    expect(browser().location().path()).toEqual('/activity/pledges');
    var fundraiserPath = "a[ng-href='/fundraiser/"+MOCK.fundraiser.slug+"']";
    expect(element(fundraiserPath).count()).toEqual(1);
  });

  xdescribe("updating team settings", function() {
    beforeEach(function() {
      Mock.init();
      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success-updated");
      Mock.pushScenario("/user", "GET", "success-email-auth");

      Mock.pushScenario("/teams/:id", "PUT", "success");
      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success");
      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/settings');
    });

    it("should update name", function() {
      input('form_data.name').enter('Test Team Two Point O');
      using("form[ng-submit='create_team()']").element('submit[type=submit]').click();
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/settings');
      expect(input('form_data.name').val()).toEqual('Test Team Two Point O');
    });

    it("should update slug", function() {
      input('form_data.slug').enter('test_old-team-infinity-two-point-o');
      using("form[ng-submit='create_team()']").element('submit[type=submit]').click();
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/settings');
      expect(input('form_data.slug').val()).toEqual('test_old-team-infinity-two-point-o');
    });

    it("should update custom url", function() {
      input('form_data.url').enter('http://www.test_old-this-site-and-register-the-domain-before-someone-else-does.com');
      using("form[ng-submit='create_team()']").element('submit[type=submit]').click();
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/settings');
      expect(input('form_data.url').val()).toEqual('http://www.test_old-this-site-and-register-the-domain-before-someone-else-does.com');
    });

    it("should update bio", function() {
      input('form_data.bio').enter('now this, this is a bio');
      using("form[ng-submit='create_team()']").element('submit[type=submit]').click();
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/settings');
      expect(input('form_data.bio').val()).toEqual('now this, this is a bio');
    });
  });

  describe("adding/inviting members --", function() {

    beforeEach(function() {
      Mock.init();
    });

    it("add/invite member", function() {
      Mock.pushScenario("/email_registered", "GET", "email-available");

      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success");
      Mock.pushScenario("/teams/:id/invites", "GET", "success");
      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success");
      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/members/manage');

      expect(element('div#pending-members').attr('style')).toContain('height: 0px;');
      input('new_member.email').enter('test_old-teammate@bountysource.com');
      element("button[type=submit]").click();
      sleep(1);
      expect(element('div#pending-members').attr('style')).toContain('height: auto;');
    });

  });

  describe("changing team member permissions --", function() {

    beforeEach(function() {
      Mock.init();
    });

    it("toggle public feature", function() {
      Mock.pushScenario("/teams/:id/members/:id", "PUT", "developer-true-public-false");
      Mock.pushScenario("/teams/:id/invites", "GET", "success");
      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success");
      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/members/manage');

      expect(element('table.members > tbody > tr:first > td > input[ng-model="member.is_public"]:checked').count()).toBe(1);
      input('member.is_public').check();
      element("table.members > tbody > tr:first button[ng-click='update_member(member)']").click();
      expect(element('table.members > tbody > tr:first > td > input[ng-model="member.is_public"]:checked').count()).toBe(0);
    });

    it("toggle developer feature", function() {
      Mock.pushScenario("/teams/:id/members/:id", "PUT", "developer-false-public-false");
      Mock.pushScenario("/teams/:id/invites", "GET", "success");
      Mock.pushScenario("/teams/:id/members", "GET", "success");
      Mock.pushScenario("/teams/:id", "GET", "success");
      Mock.pushScenario("/people/:id/teams", "GET", "success");
      Mock.pushScenario("/user", "GET", "success-email-auth");
      browser().navigateTo('/teams/'+MOCK.valid_team.slug+'/members/manage');

      expect(element('table.members > tbody > tr:first > td > input[ng-model="member.is_developer"]:checked').count()).toBe(1);
      input('member.is_developer').check();
      element("table.members > tbody > tr:first button[ng-click='update_member(member)']").click();
      expect(element('table.members > tbody > tr:first > td > input[ng-model="member.is_developer"]:checked').count()).toBe(0);
    });

    xit("should remove a user from a team", function() {});
  });

  xdescribe("adding funds to team", function() {
    beforeEach(function() {
      Mock.init();
    });
  });

});

