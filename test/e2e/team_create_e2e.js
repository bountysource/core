/*jshint -W117 */
'use strict';

describe("Scenario: Creating a team --", function() {

  beforeEach(function() {
    Mock.init();
    browser().navigateTo('/teams/new');
  });

  it("should error without name", function() {
    var teamName = "";
    var teamSlug = "test-team-infinity";
    Mock.push("/teams", "POST", {}, {"data":{"error":"Missing required fields: [:name]","params":[["name"]]},"meta":{"status":422,"success":false,"pagination":null}});
    Mock.push("/teams/undefined/members", "GET", {}, {"data":{"error":"Team not found"},"meta":{"status":404,"success":false,"pagination":null}});
    Mock.push("/teams/undefined", "GET", {}, {"data":{"error":"Team not found"},"meta":{"status":404,"success":false,"pagination":null}});
    Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});

    using('form').input('form_data.name').enter(teamName);
    using('form').input('form_data.slug').enter(teamSlug);
    using('form').input('form_data.url').enter('http://www.bountysource.com');
    using('form').input('form_data.image_url').enter('https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/jny9veh9xwqljpqpox0z.png');
    using('form').input('form_data.bio').enter("bountysource is THE open source funding platform");
    using('form').element('submit.btn').click();
    expect(element('.alert.alert-error').text()).toContain("Missing required fields");
    expect(element('.alert.alert-error').text()).toContain(":name");

  });

  it("should not allow characters in custom url", function() {
    var teamName = "Test Team";
    var teamSlug = "!*$#@";
    Mock.push("/teams/undefined/members", "GET", {}, {"data":{"error":"Team not found"},"meta":{"status":404,"success":false,"pagination":null}});
    Mock.push("/teams/undefined", "GET", {}, {"data":{"error":"Team not found"},"meta":{"status":404,"success":false,"pagination":null}});
    Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});
    using('form').input('form_data.name').enter(teamName);
    using('form').input('form_data.slug').enter(teamSlug);
    expect(input('form_data.slug').val()).toMatch('');
  });

  describe("successful team creation --", function() {
    it("should redirect to team member management page", function() {
      var teamName = "Test Team";
      var teamSlug = "test-team-infinity";
      Mock.push("/teams/"+teamSlug+"/members", "GET", {}, {"data":[{"is_admin":true,"is_spender":false,"is_public":true,"added_at":"2013-09-16T19:08:36Z","id":18963,"slug":"18963-TheManliest","display_name":"TheManliest","frontend_path":"/users/18963-TheManliest","frontend_url":"https://staging.bountysource.com/users/18963-TheManliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/7507f125df56868f753571aadf69c734","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/7507f125df56868f753571aadf69c734","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/7507f125df56868f753571aadf69c734","created_at":"2013-08-13T20:44:16Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false}],"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/teams/"+teamSlug, "GET", {}, {"data":{"id":151,"name":teamName,"slug":teamSlug,"url":"http://www.bountysource.com","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/jny9veh9xwqljpqpox0z.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/jny9veh9xwqljpqpox0z.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/jny9veh9xwqljpqpox0z.png","featured":false,"bio":"bountysource is the open source funding platform","account_balance":"0.0","trackers":[]},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/teams/"+teamSlug+"/invites", "GET", {}, {"data":[],"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/teams/"+teamSlug+"/members", "GET", {}, {"data":[{"is_admin":true,"is_spender":false,"is_public":true,"added_at":"2013-09-16T19:08:36Z","id":18963,"slug":"18963-TheManliest","display_name":"TheManliest","frontend_path":"/users/18963-TheManliest","frontend_url":"https://staging.bountysource.com/users/18963-TheManliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/7507f125df56868f753571aadf69c734","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/7507f125df56868f753571aadf69c734","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/7507f125df56868f753571aadf69c734","created_at":"2013-08-13T20:44:16Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false}],"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/teams/"+teamSlug, "GET", {}, {"data":{"id":151,"name":teamName,"slug":teamSlug,"url":"http://www.bountysource.com","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/jny9veh9xwqljpqpox0z.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/jny9veh9xwqljpqpox0z.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/jny9veh9xwqljpqpox0z.png","featured":false,"bio":"bountysource is the open source funding platform","account_balance":"0.0","trackers":[]},"meta":{"status":200,"success":true,"pagination":null}});
      Mock.push("/teams", "POST", {}, {"data":{"id":150,"name":teamName,"slug":teamSlug,"url":null,"image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/noaoqqwxegvmulwus0un.png","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/noaoqqwxegvmulwus0un.png","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/noaoqqwxegvmulwus0un.png","featured":false,"bio":null,"account_balance":"0.0","trackers":[]},"meta":{"status":201,"success":true,"pagination":null}});
      Mock.push("/teams/undefined/members", "GET", {}, {"data":{"error":"Team not found"},"meta":{"status":404,"success":false,"pagination":null}});
      Mock.push("/teams/undefined", "GET", {}, {"data":{"error":"Team not found"},"meta":{"status":404,"success":false,"pagination":null}});
      Mock.push("/user", "GET", {}, {"data":{"id":18963,"slug":"18963-themanliest","display_name":"TheManliest","frontend_path":"#users/18963-themanliest","frontend_url":"https://www.bountysource.com/#users/18963-themanliest","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/1ac42adc0fa84d7ff4619c445e7fda7d","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/1ac42adc0fa84d7ff4619c445e7fda7d","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/1ac42adc0fa84d7ff4619c445e7fda7d","created_at":"2013-07-08T20:31:57Z","bio":null,"location":null,"company":null,"url":null,"public_email":null,"admin":false,"first_name":"Mister","last_name":"ManlyMan","email":"mr_manly@gmail.com","last_seen_at":"2013-08-06T08:48:44Z","updated_at":"2013-08-06T08:48:44Z","paypal_email":null,"exclude_from_newsletter":false,"address":null,"account":{"id":null,"type":"Account::Personal","balance":0},"github_account":null,"twitter_account":null,"facebook_account":null,"gittip_account":null},"meta":{"status":200,"success":true,"pagination":null}});

      using('form').input('form_data.name').enter(teamName);
      using('form').input('form_data.slug').enter(teamSlug);
      using('form').input('form_data.url').enter('http://www.bountysource.com');
      using('form').input('form_data.image_url').enter('https://cloudinary-a.akamaihd.net/bountysource/image/upload/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/jny9veh9xwqljpqpox0z.png');
      using('form').input('form_data.bio').enter("bountysource is THE open source funding platform");
      using('form').element('submit.btn').click();
      expect(browser().location().path()).toEqual('/teams/'+teamSlug+'/members/manage');
    });
  });

});