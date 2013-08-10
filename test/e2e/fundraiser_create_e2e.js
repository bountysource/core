/*jshint -W117 */
'use strict';

angular.scenario.dsl('cookies', function() {
  var chain = {};
  chain.clear = function(name) {
      return this.addFutureAction('clear cookies', function($window, $document, done) {
            var injector = $window.angular.element($window.document.body).inheritedData('$injector');
            var cookies = injector.get('$cookies');
            console.log("Clearing cookie", cookies[name]);
            var root = injector.get('$rootScope');
            delete cookies[name];
            root.$apply(); // forcibly flush the cookie changes
            done();
          });
    };

  return function() {
    return chain;
  };
});

function findAndFillFields (formPrefix, mockData) {
  for (var key in mockData) {
    input(formPrefix + "." + key).enter(mockData[key]);
    expect(input(formPrefix + "." + key).val()).toBe(mockData[key]);
  }
}


describe('Scenario: Creating A Fundraiser --', function () {
  beforeEach(function () {
    Mock.init();
  });

  // First test you can find all the required elements on the page
  describe('Form View and Inputs', function () {

    it("should ALLOW registered user with valid password to SIGN IN", function() {
      // for the user info dropdown in the nav...
      browser().navigateTo('/signin');
      cookies().clear("v2_access_token");
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      // for the $person resolve to require auth on a page
      // go look at $api.load_current_person_from_cookies in api.js:431
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user/login", "POST", MOCK.valid_user, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"access_token":"18963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc"},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user/login", "POST", {"email": MOCK.existing_user.email}, {"data":{"error":"Password not correct.","email_is_registered":true},"meta":{"status":404,"success":false,"pagination":null}}); //see signin.js:54 and $api.check_email_address. Response doesn't call ".data"

      fill_form(MOCK.valid_user);
      blurEmailField();
      expect(element(".help-inline:visible").html()).toEqual("<small>Found!</small>");
      expect(using('form[name=form]').element(".btn:visible").text()).toEqual("Sign In");
      using('form[name=form]').element(".btn:visible").click();
    });

    it("should allow signed in user to view the fundraiser form", function () {
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-07T20:19:35Z","updated_at":"2013-08-07T20:19:35Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-07T20:19:35Z","updated_at":"2013-08-07T20:19:35Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-07T20:19:35Z","updated_at":"2013-08-07T20:19:35Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
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

    it("should enable create fundraiser button when all fields are filled", function () {
      input('fundraiser.title').enter(MOCK.fundraiser.title);
      input('fundraiser.description').enter(MOCK.fundraiser.description);
      input('fundraiser.short_description').enter(MOCK.fundraiser.short_description);
      var found_button = element("button[ng-click='create()']:enabled").count();
      expect(found_button).toBe(1);
    });

  });

  describe("Submitting a fundraiser", function() {

    describe("Creating the fundraiser", function() {
      it("should allow signed in user to create a fundraiser", function() {
        Mock.push("/user/fundraisers/451-fake-fundraiser", "GET", {}, {"data":{"id":451,"slug":"451-fake-fundraiser","title":"Fake Fundraiser!","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/gmha7sd16khmaatwokds.jpg","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/gmha7sd16khmaatwokds.jpg","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/gmha7sd16khmaatwokds.jpg","frontend_path":"#fundraisers/451-fake-fundraiser","short_description":"A little test description","total_pledged":"0.0","funding_goal":15000,"published":false,"published_at":null,"featured":false,"created_at":"2013-08-09T20:01:45Z","updated_at":"2013-08-09T20:01:45Z","days_open":30,"days_remaining":30,"in_progress":false,"frontend_updates_path":"#fundraisers/451-fake-fundraiser/updates","pledge_count":0,"ends_at":"2013-09-08T20:01:46+00:00","owner":true,"frontend_edit_path":"#fundraisers/451-fake-fundraiser/edit","frontend_info_path":"#fundraisers/451-fake-fundraiser/info","description":"Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.","hidden":false,"homepage_url":"http://fakehome.com","repo_url":"http://hithub.com","about_me":null,"publishable":true,"description_html":"<p>Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.</p>\n","frontend_url":"https://www-qa.bountysource.com/#fundraisers/451-fake-fundraiser","min_days_open":14,"max_days_open":30,"min_end_by_date":"2013-08-23T00:00:00+00:00","max_end_by_date":"2013-09-08T23:59:59+00:00","person":{"id":19896,"slug":"19896-themanliest","display_name":"TheManliest","frontend_path":"#users/19896-themanliest","frontend_url":"https://www-qa.bountysource.com/#users/19896-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/noaoqqwxegvmulwus0un.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/noaoqqwxegvmulwus0un.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/noaoqqwxegvmulwus0un.png","created_at":"2013-08-09T00:06:26Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false},"rewards":[],"updates":[]},"meta":{"status":200,"success":true,"pagination":null}});
        Mock.push("/user/fundraisers", "POST", MOCK.fundraiserPayload, {"data":{"id":451,"slug":"451-fake-fundraiser","title":"Fake Fundraiser!","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/chdlzlvfptfkdmroripf.jpg","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/chdlzlvfptfkdmroripf.jpg","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/chdlzlvfptfkdmroripf.jpg","frontend_path":"#fundraisers/451-fake-fundraiser","short_description":"A little test description","total_pledged":"0.0","funding_goal":15000,"published":false,"published_at":null,"featured":false,"created_at":"2013-08-09T00:17:35Z","updated_at":"2013-08-09T00:17:35Z","days_open":30,"days_remaining":30,"in_progress":false,"frontend_updates_path":"#fundraisers/451-fake-fundraiser/updates","pledge_count":0,"ends_at":"2013-09-08T00:17:36+00:00","owner":true,"frontend_edit_path":"#fundraisers/451-fake-fundraiser/edit","frontend_info_path":"#fundraisers/451-fake-fundraiser/info","description":"Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.","hidden":false,"homepage_url":"http://fakehome.com","repo_url":"http://hithub.com","about_me":null,"publishable":true,"description_html":"<p>Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.</p>\n","frontend_url":"https://www-qa.bountysource.com/#fundraisers/451-fake-fundraiser","min_days_open":14,"max_days_open":30,"min_end_by_date":"2013-08-23T00:00:00+00:00","max_end_by_date":"2013-09-08T23:59:59+00:00","person":{"id":19896,"slug":"19896-themanliest","display_name":"TheManliest","frontend_path":"#users/19896-themanliest","frontend_url":"https://www-qa.bountysource.com/#users/19896-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/noaoqqwxegvmulwus0un.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/noaoqqwxegvmulwus0un.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/noaoqqwxegvmulwus0un.png","created_at":"2013-08-09T00:06:26Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false},"rewards":[],"updates":[]},"meta":{"status":200,"success":true,"pagination":null}});
        findAndFillFields("fundraiser", MOCK.fundraiser);
        element("button[ng-click='create()']:enabled").click();
      });

      it("should take user to Edit page upon creation", function() {
        Mock.push("/user/fundraisers/451-fake-fundraiser", "GET", {}, {"data":{"id":451,"slug":"451-fake-fundraiser","title":"Fake Fundraiser!","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/gmha7sd16khmaatwokds.jpg","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/gmha7sd16khmaatwokds.jpg","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/gmha7sd16khmaatwokds.jpg","frontend_path":"#fundraisers/451-fake-fundraiser","short_description":"A little test description","total_pledged":"0.0","funding_goal":15000,"published":false,"published_at":null,"featured":false,"created_at":"2013-08-09T20:01:45Z","updated_at":"2013-08-09T20:01:45Z","days_open":30,"days_remaining":30,"in_progress":false,"frontend_updates_path":"#fundraisers/451-fake-fundraiser/updates","pledge_count":0,"ends_at":"2013-09-08T20:01:46+00:00","owner":true,"frontend_edit_path":"#fundraisers/451-fake-fundraiser/edit","frontend_info_path":"#fundraisers/451-fake-fundraiser/info","description":"Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.","hidden":false,"homepage_url":"http://fakehome.com","repo_url":"http://hithub.com","about_me":null,"publishable":true,"description_html":"<p>Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.</p>\n","frontend_url":"https://www-qa.bountysource.com/#fundraisers/451-fake-fundraiser","min_days_open":14,"max_days_open":30,"min_end_by_date":"2013-08-23T00:00:00+00:00","max_end_by_date":"2013-09-08T23:59:59+00:00","person":{"id":19896,"slug":"19896-themanliest","display_name":"TheManliest","frontend_path":"#users/19896-themanliest","frontend_url":"https://www-qa.bountysource.com/#users/19896-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/noaoqqwxegvmulwus0un.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/noaoqqwxegvmulwus0un.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/noaoqqwxegvmulwus0un.png","created_at":"2013-08-09T00:06:26Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false},"rewards":[],"updates":[]},"meta":{"status":200,"success":true,"pagination":null}});
        expect(browser().location().path()).toBe("/fundraisers/451-fake-fundraiser/edit");
        // element("button[ng-click='save()']").click();
        //come back here to finish submitting the fundraiser
      });

    });

    describe("Edit Page for new fundraiser", function() {

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
          expect(element("div[ng-controller='RewardsController']").count()).toBe(1)
        });

        it("should initially have a disabled 'Add Reward' Button", function() {
          expect(element("button[ng-click='create_reward(fundraiser)']:disabled").count()).toBe(1);
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
          findAndFillFields("new_reward", MOCK.new_reward)
          expect(element("button[ng-click='create_reward(fundraiser)']:enabled").count()).toBe(1);
          pause();
        });

        it("should allow the submission of a new reward", function() {
          pause();
          Mock.push("/user/fundraisers/451/rewards", "POST", MOCK.newRewardPayload, {"data":{"id":809,"amount":25,"description":"A cool t shirt","claimed":0,"limited_to":10,"sold_out":false,"created_at":"2013-08-10T00:23:44Z","fulfillment_details":"Please email your size!"},"meta":{"status":201,"success":true,"pagination":null}});
          element("button[ng-click='create_reward(fundraiser)']:enabled").click();
          pause();
          expect(element("div[heading='$25 Reward']").count()).toBe(1)
        });

      });

    });

  });

});

describe("CLEAR COOKIES TO ALLOW REFRESH", function() {
   it("should clear cookies at end of test", function() {
      cookies().clear("v2_access_token"); //clear cookies at the end of the rest to allow refreshing of tests in-browser
    });
});
