///*jshint -W117 */
//
//'use strict';
//
//describe('Scenario: Creating A Fundraiser --', function () {
//  beforeEach(function () {
//    browser().navigateTo("/fundraisers/new");
//  });
//
//  function id_exists(id) {
//    return expect(element("#" + id).count()).toEqual(1);
//  }
//
//  // First test you can find all the required elements on the page
//  xdescribe('Fundraiser Input IDs exist', function () {
//    it("should first signin", function () {
//      browser().navigateTo("/signin");
//      fill_form(MOCK.signed_in_user);
//      element("button:contains('Sign In')").click();
//      sleep(2);
//      browser().navigateTo("/fundraisers/new");
//      var current_path = browser().location().url();
//      expect(current_path).toBe("/fundraisers/new");
//    });
//
//    it("should have an element title", function () {
//      id_exists("fundraiser-title");
//    });
//
//    it("should have an element for funding goal", function () {
//      id_exists("funding-goal");
//    });
//
//    it("should have an element for repo url", function () {
//      id_exists("repo-url");
//    });
//
//    it("should have an element for homepage url", function () {
//      id_exists("homepage-url");
//    });
//
//    it("should have an element for image url", function () {
//      id_exists("image-url");
//    });
//
//    it("should have an element for description", function () {
//      id_exists("fundraiser-shortdes");
//    });
//
//    it("should have a Button to submit", function () {
//      id_exists("create-fundraiser-submit");
//    });
//  });
//
//  describe("Fundraiser entering items", function () {
//    it("should first signin", function () {
//      browser().navigateTo("/signin");
//      fill_form(MOCK.signed_in_user);
//      element("button:contains('Sign In')").click();
//      sleep(2);
//      browser().navigateTo("/fundraisers/new");
//    });
//
//    it("should be on the correct page", function () {
//      var current_path = browser().location().url();
//      expect(current_path).toBe("/fundraisers/new");
//    });
//
//    /////////////// Check if necessary elements exist /////////////////////
//    it("should not find something that I made up", function () {
//      expect(input('a13yczzymn')).not().toBeDefined();
//    });
//
//    it("should have input for title", function () {
//      expect(input('fundraiser.title').val()).toBeDefined();
//    });
//
//    it("should have input for funding_goal", function () {
//      expect(input('fundraiser.funding_goal').val()).toBeDefined();
//    });
//
//    it("should have input for image_url", function () {
//      expect(input('fundraiser.image_url').val()).toBeDefined();
//    });
//
//    it("should have input for homepage_url", function () {
//      expect(input('fundraiser.homepage_url').val()).toBeDefined();
//    });
//
//    it("should have input for repo_url", function () {
//      expect(input('fundraiser.repo_url').val()).toBeDefined();
//    });
//
//    it("should have input for description", function () {
//      expect(input('fundraiser.description').val()).toBeDefined();
//    });
//
//    it("should have input for short_description", function () {
//      expect(input('fundraiser.short_description').val()).toBeDefined();
//    });
//
//    it("should have a button for submit", function () {
//      Mock.define({
//        api_mock: {
//          "/user": Mock.get('user')
//        }
//      });
//
//      var found_button = element("button[ng-click='create()']").count();
//      expect(found_button).toEqual(1);
//    });
//
//    //////////////////////////////////////////////////////////
//    //////// Checking if the checkbox works correctly ////////
//    //////////////////////////////////////////////////////////
//    var mock_fundraiser = {
//      title:             'A SUPPER DUPER PROJECT',
//      description:       'this project is the craziest s&*# you ever seen',
//      short_description: 'slappin the bass mon'
//    };
//
//    var expected_checks = 1; //funding goal defaultly set => one condition is met
//    it("should initially have only funding goal checked", function () {
//      expect(element('input:checked').count()).toBe(expected_checks);
//    });
//
//    it("should have 2 checked when filled = {title} && bounty_goal is valid", function () {
//      input('fundraiser.title').enter(mock_fundraiser.title);
//      expected_checks = 2;
//      expect(element('input:checked').count()).toBe(expected_checks);
//    });
//
//    it("should have 3 checked filled = {title, description} && bounty_goal is valid", function () {
//      input('fundraiser.title').enter(mock_fundraiser.title);
//      input('fundraiser.description').enter(mock_fundraiser.description);
//      expected_checks = 3;
//      expect(element('input:checked').count()).toBe(expected_checks);
//    });
//
//    it("should have 4 checked when all fields are valid", function () {
//      input('fundraiser.title').enter(mock_fundraiser.title);
//      input('fundraiser.description').enter(mock_fundraiser.description);
//      input('fundraiser.short_description').enter(mock_fundraiser.short_description);
//      expected_checks = 4;
//      expect(element('input:checked').count()).toBe(expected_checks);
//    });
//
//    it("should enable create fundraiser button when all fields are filled", function () {
//      input('fundraiser.title').enter(mock_fundraiser.title);
//      input('fundraiser.description').enter(mock_fundraiser.description);
//      input('fundraiser.short_description').enter(mock_fundraiser.short_description);
//      var found_button = element("button[ng-click='create()']:enabled").count();
//      expect(found_button).toBe(1);
//    });
//  });
//});