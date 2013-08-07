/*jshint -W117 */
'use strict';


describe('Scenario: Creating A Fundraiser --', function () {
  beforeEach(function () {
    browser().navigateTo("/fundraisers/new");
    Mock.init();
  });

  function id_exists(id) {
    return expect(element("#" + id).count()).toEqual(1);
  }

  // First test you can find all the required elements on the page
  describe('Create Fundraiser', function () {

    it("should ALLOW registered user with valid password to SIGN IN", function() {
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user/login", "POST", MOCK.existing_user, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"access_token":"18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc"},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user/login", "POST", {"email": MOCK.existing_user.email}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404,"success":false,"pagination":null}}); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"
      fill_form(MOCK.valid_user);
      using('form[name=form]').element("input[name=email]").query(function(element, done) {
        var evt = document.createEvent("Event");
        evt.initEvent('blur', false, true);
        element[0].dispatchEvent(evt);
        done();
      });
      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
      using('form[name=form]').element(".btn:visible").click();
    });

    it("should first signin", function () {
      //load current person from cookies
      Mock.push("/user", "GET", {"access_token":"18963.1375988044.ea09182a28c1f7134e80ba948140660cdbdf906"}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-07T20:19:35Z","updated_at":"2013-08-07T20:19:35Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      expect(browser().location().path()).toBe("/fundraisers/new");
    });

    // it("should have an element title", function () {
    //   id_exists("fundraiser-title");
    // });

    // it("should have an element for funding goal", function () {
    //   id_exists("funding-goal");
    // });

    // it("should have an element for repo url", function () {
    //   id_exists("repo-url");
    // });

    // it("should have an element for homepage url", function () {
    //   id_exists("homepage-url");
    // });

    // it("should have an element for image url", function () {
    //   id_exists("image-url");
    // });

    // it("should have an element for description", function () {
    //   id_exists("fundraiser-shortdes");
    // });

    // it("should have a Button to submit", function () {
    //   id_exists("create-fundraiser-submit");
    // });
  });

  // describe("Fundraiser entering items", function () {
  //   it("should first signin", function () {
  //     browser().navigateTo("/signin");
  //     fill_form(MOCK.signed_in_user);
  //     element("button:contains('Sign In')").click();
  //     sleep(2);
  //     browser().navigateTo("/fundraisers/new");
  //   });

  //   it("should be on the correct page", function () {
  //     var current_path = browser().location().url();
  //     expect(current_path).toBe("/fundraisers/new");
  //   });

  //   /////////////// Check if necessary elements exist /////////////////////
  //   it("should not find something that I made up", function () {
  //     expect(input('a13yczzymn')).not().toBeDefined();
  //   });

  //   it("should have input for title", function () {
  //     expect(input('fundraiser.title').val()).toBeDefined();
  //   });

  //   it("should have input for funding_goal", function () {
  //     expect(input('fundraiser.funding_goal').val()).toBeDefined();
  //   });

  //   it("should have input for image_url", function () {
  //     expect(input('fundraiser.image_url').val()).toBeDefined();
  //   });

  //   it("should have input for homepage_url", function () {
  //     expect(input('fundraiser.homepage_url').val()).toBeDefined();
  //   });

  //   it("should have input for repo_url", function () {
  //     expect(input('fundraiser.repo_url').val()).toBeDefined();
  //   });

  //   it("should have input for description", function () {
  //     expect(input('fundraiser.description').val()).toBeDefined();
  //   });

  //   it("should have input for short_description", function () {
  //     expect(input('fundraiser.short_description').val()).toBeDefined();
  //   });

  //   it("should have a button for submit", function () {
  //     Mock.define({
  //       api_mock: {
  //         "/user": Mock.get('user')
  //       }
  //     });

  //     var found_button = element("button[ng-click='create()']").count();
  //     expect(found_button).toEqual(1);
  //   });

  //   //////////////////////////////////////////////////////////
  //   //////// Checking if the checkbox works correctly ////////
  //   //////////////////////////////////////////////////////////
  //   var mock_fundraiser = {
  //     title:             'A SUPPER DUPER PROJECT',
  //     description:       'this project is the craziest s&*# you ever seen',
  //     short_description: 'slappin the bass mon'
  //   };

  //   var expected_checks = 1; //funding goal defaultly set => one condition is met
  //   it("should initially have only funding goal checked", function () {
  //     expect(element('input:checked').count()).toBe(expected_checks);
  //   });

  //   it("should have 2 checked when filled = {title} && bounty_goal is valid", function () {
  //     input('fundraiser.title').enter(mock_fundraiser.title);
  //     expected_checks = 2;
  //     expect(element('input:checked').count()).toBe(expected_checks);
  //   });

  //   it("should have 3 checked filled = {title, description} && bounty_goal is valid", function () {
  //     input('fundraiser.title').enter(mock_fundraiser.title);
  //     input('fundraiser.description').enter(mock_fundraiser.description);
  //     expected_checks = 3;
  //     expect(element('input:checked').count()).toBe(expected_checks);
  //   });

  //   it("should have 4 checked when all fields are valid", function () {
  //     input('fundraiser.title').enter(mock_fundraiser.title);
  //     input('fundraiser.description').enter(mock_fundraiser.description);
  //     input('fundraiser.short_description').enter(mock_fundraiser.short_description);
  //     expected_checks = 4;
  //     expect(element('input:checked').count()).toBe(expected_checks);
  //   });

  //   it("should enable create fundraiser button when all fields are filled", function () {
  //     input('fundraiser.title').enter(mock_fundraiser.title);
  //     input('fundraiser.description').enter(mock_fundraiser.description);
  //     input('fundraiser.short_description').enter(mock_fundraiser.short_description);
  //     var found_button = element("button[ng-click='create()']:enabled").count();
  //     expect(found_button).toBe(1);
  //   });
  // });
});
